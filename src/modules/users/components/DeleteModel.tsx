import type { AppDispatch, RootState } from "@src/config/store";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, getAllUsers, setDeleteModel } from "../slice";

interface DeleteModelProps {
  userId: string | null;
  setDeleteUserId: React.Dispatch<React.SetStateAction<string | null>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
}

const DeleteModel = ({
  userId,
  setDeleteUserId,
  setPage,
  pageSize,
}: DeleteModelProps) => {
  if (!userId) return;
  const dispatch = useDispatch<AppDispatch>();
  const { deleteModel, deleteLoading, page, user } = useSelector(
    (state: RootState) => state.data,
  );

  const handleDelete = async () => {
    const isLastItemOnPage = user.length === 1;
    const nextPage = isLastItemOnPage && page > 1 ? page - 1 : page;

    const res = await dispatch(deleteUser(userId as string));

    if (!deleteUser.fulfilled.match(res)) {
      return;
    }

    setDeleteUserId(null);

    if (nextPage !== page) {
      setPage(nextPage);
    } else {
      dispatch(
        getAllUsers({
          page,
          limit: pageSize,
        }),
      );
    }
  };

  return (
    <>
      <Modal
        open={deleteModel}
        confirmLoading={deleteLoading}
        onCancel={() => dispatch(setDeleteModel(false))}
        onOk={handleDelete}
        title="Delete User"
      >
        <h4 style={{ marginBottom: 0 }}>
          Are you sure you want to delete this user?
        </h4>
        <p style={{ marginTop: "5px" }}>
          All files uploaded by this user will be permanently deleted and cannot
          be recovered.
        </p>
      </Modal>
    </>
  );
};

export default DeleteModel;
