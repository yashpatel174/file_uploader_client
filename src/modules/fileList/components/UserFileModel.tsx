import { LeftOutlined, LoadingOutlined } from "@ant-design/icons";
import type { AppDispatch, RootState } from "@src/config/store";
import type { AudioResult, ISelectedFile } from "@src/interfaces/interface";
import { getAudioPlayed, setAudioLoading } from "@src/modules/users/slice";
import { Button, Col, Modal, Row, Space, Spin } from "antd";
import Text from "antd/es/typography/Text";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAudio, setOpenUserFiles } from "../slice";

export interface IUserFileModel {
  userFiles: ISelectedFile;
}

const UserFileModel = ({ userFiles }: IUserFileModel) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openUserFiles } = useSelector((state: RootState) => state.file);
  const [audio, setAudio] = useState<AudioResult[]>([]);
  const [audioUI, setAudioUI] = useState<{ audioId: string; play: boolean }>({
    audioId: "",
    play: false,
  });
  const { audioLoading } = useSelector((state: RootState) => state.data);

  useEffect(() => {
    const { userId, platform } = userFiles;
    if (!userId) return;
    if (!platform) return;
    dispatch(getAllAudio({ _id: userId, platform })).then((res) => {
      if (
        res.payload &&
        typeof res.payload !== "string" &&
        "success" in res.payload === true
      ) {
        const { result } = res.payload;
        setAudio(result);
      }
    });
  }, []);

  const handleAudioPlay = async (audioId: string) => {
    try {
      dispatch(setAudioLoading(true));
      setAudioUI({ audioId, play: true });
      await dispatch(getAudioPlayed(audioId as string));
    } catch (error) {
      console.log("error: ", (error as Error).message);
    } finally {
      dispatch(setAudioLoading(false));
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <>
      <Modal
        open={openUserFiles}
        width={"50em"}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "scroll",
            overflowX: "hidden",
          },
        }}
        onCancel={() => {
          setAudio([]);
          dispatch(setOpenUserFiles(false));
        }}
        title={`${userFiles.platform}`}
      >
        <Row gutter={16}>
          {audio?.map((aud, idx) => (
            <Fragment key={idx}>
              <Col
                xs={24}
                sm={10}
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
                xs={24}
                sm={14}
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
                          height: "40px",
                          display: "flex",
                          paddingRight: "270px",
                          justifyContent: "center",
                        }}
                      />
                    ) : (
                      <>
                        {aud.success === false ? (
                          <Text
                            style={{
                              height: "40px",
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {aud.lastError}
                          </Text>
                        ) : (
                          <audio
                            controls
                            preload="metadata"
                            style={{ width: "100%", height: "3em" }}
                            src={aud.audioUrl}
                          />
                        )}
                      </>
                    )}
                    <LeftOutlined
                      style={{ margin: "0 10px" }}
                      onClick={() => setAudioUI({ audioId: "", play: false })}
                    />
                  </div>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => handleAudioPlay(aud.id)}
                  >
                    Play
                  </Button>
                )}
              </Col>
            </Fragment>
          ))}
        </Row>
      </Modal>
    </>
  );
};

export default UserFileModel;
