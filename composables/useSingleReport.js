import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { createToast } from "mosha-vue-toastify";

const fetcher = (url) =>
  $fetch(url, {
    headers: useRequestHeaders(["cookie"]),
  });
console.log("🥩🥩🥩");

export const useSingleReport = () => {
  const route = useRoute();
  const queryClient = useQueryClient();
  const {
    isLoading,
    data: report,
    isError,
  } = useQuery({
    queryKey: [`report`, route.params.id],
    queryFn: () => fetcher(`/api/reports/${route.params.id}`),
    retry: 0,
  });

  const areAllEulasApproved = ({ name, suggested_criteria }) => {
    return suggested_criteria.every(
      (criteria) => report.value?.state?.[name]?.[criteria]
    );
  };

  const { mutateAsync: mutateApproval } = useMutation({
    mutationFn: ({ pkg, eula }) =>
      $fetch(`/api/reports/${route.params.id}`, {
        method: "PUT",
        body: {
          ...report.value.state,
          [pkg]: {
            ...report.value?.state?.[pkg],
            [eula]: report.value?.state?.[pkg]?.[eula] ? false : true,
          },
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["report", route.params.id] }),
    onError: () =>
      createToast("There has been an issue toggling approval", {
        type: "danger",
        hideProgressBar: true,
      }),
  });

  const { mutateAsync: mutateNote, isLoading: isLoadingNote } = useMutation({
    mutationFn: ({ pkg, note }) =>
      $fetch(`/api/reports/${route.params.id}`, {
        method: "PUT",
        body: {
          ...report.value.state,
          [pkg]: {
            ...report.value?.state?.[pkg],
            note,
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", route.params.id] });
      createToast("Note updated", {
        type: "success",
        hideProgressBar: true,
      });
    },
    onError: () =>
      createToast("There was an issue updating the note", {
        type: "danger",
        hideProgressBar: true,
      }),
  });

  return {
    report,
    isLoading,
    fetchError: isError,
    areAllEulasApproved,
    toggleEulaPackageApproval: mutateApproval,
    addNote: mutateNote,
    isLoadingNote,
  };
};
