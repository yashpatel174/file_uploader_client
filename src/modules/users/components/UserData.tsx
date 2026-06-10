import { LeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Row, Space, Spin } from "antd";
import Text from "antd/es/typography/Text";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../config/store";
import type { IUserDataProps } from "../../../interfaces/interface";
import {
  getAllFiles,
  getAudioPlayed,
  setAudioLoading,
  setCloseUserData,
} from "../slice";

const UserData: React.FC<IUserDataProps> = ({ userData }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userName, count } = userData;
  const [audioUI, setAudioUI] = useState<{ audioId: string; play: boolean }>({
    audioId: "",
    play: false,
  });
  const { fileModel, audio, audioLoading } = useSelector(
    (state: RootState) => state.data,
  );

  const handleClose = () => dispatch(setCloseUserData());
  const getAudio = async () => await dispatch(getAllFiles(userData.userId));

  useEffect(() => {
    getAudio();
  }, []);

  const handleAudioPlay = async (audioId) => {
    try {
      dispatch(setAudioLoading(true));
      setAudioUI({ audioId, play: true });
      await dispatch(getAudioPlayed(audioId as string));
    } catch (error) {
      console.log("error: ", error.message);
    } finally {
      dispatch(setAudioLoading(false));
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Modal
      title={`${userName} (${count})`}
      footer={null}
      open={fileModel}
      onCancel={handleClose}
      width={"45em"}
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "scroll",
          overflowX: "hidden",
        },
      }}
    >
      <Row gutter={16}>
        {audio?.map((aud, idx) => (
          <React.Fragment key={idx}>
            <Col
              span={10}
              style={{
                display: "flex",
                alignItems: "center",
                margin: "10px 0",
              }}
            >
              <Space>
                <Text strong>{aud.fileName}</Text>
              </Space>
            </Col>
            <Col
              span={14}
              style={{
                paddingRight: "10px",
                ...(audioUI.audioId !== aud.id && {
                  display: "flex",
                  alignItems: "center",
                }),
              }}
            >
              {audioUI.audioId === aud.id ? (
                <div style={{ display: "flex" }}>
                  {audioLoading ? (
                    <Spin
                      indicator={antIcon}
                      style={{
                        width: "100%",
                        height: "44px",
                        paddingRight: "230px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    />
                  ) : (
                    <audio
                      controls
                      preload="metadata"
                      style={{ width: "100%", height: "3em" }}
                    >
                      <source src={aud.audioUrl} />
                    </audio>
                  )}
                  <LeftOutlined
                    style={{ margin: "0 10px" }}
                    onClick={() => setAudioUI({ audioId: "", play: false })}
                  />
                </div>
              ) : (
                <Button type="primary" onClick={() => handleAudioPlay(aud.id)}>
                  Play
                </Button>
              )}
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </Modal>
  );
};

export default UserData;
