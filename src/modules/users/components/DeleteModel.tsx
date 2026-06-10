import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../config/store";
import { deleteUser, setDeleteModel } from "../slice";

const DeleteModel = ({ userId, setDeleteUserId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { deleteModel, deleteLoading } = useSelector(
    (state: RootState) => state.data,
  );

  const handleDelete = async () => {
    dispatch(deleteUser(userId)).then(() => setDeleteUserId(null));
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
