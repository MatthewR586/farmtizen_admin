import React, { useEffect, useState, useMemo } from "react";

import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Table,
  notification,
  Form,
  Modal,
  Upload,
  Image,
  Select,
  DatePicker
} from "antd";
import { backend_api } from "../config";
import axios from "axios";
import { render } from "@testing-library/react";
import {
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
// Extend dayjs with the weekday plugin
dayjs.extend(weekday);
dayjs.extend(localeData);

const Context = React.createContext({
  name: "Default",
});
const defaultTypeOptions = [
  { value: 1, label: "Join Channel or Group" },
  { value: 2, label: "Other" },
];

const defaultBonusTypeOptions = [
  { value: 1, label: "XP" },
  { value: 0, label: "Token" },
];

function Promotion() {
  const history = useHistory();
  const user = useSelector((state) => state.auth.user);

  const [searchPromotion, setSearchPromotion] = useState("");
  const [filteredPromotionData, setfilteredPromotionData] = useState([]);
  const [promotionData, setPromotionData] = useState([]);
  const [newPromotionModalOpen, setNewPromotionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [promotionTitle, setPromotionTitle] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [modalTitle, setModalTitle] = useState("");
  const [deleteScriptModalOpen, setDeleteScriptModalOpen] = useState("");
  const [currentSelectedTask, setCurrentSelectedTask] = useState([]);
  const [promotionDescription, setPromotionDescription] = useState("");
  const [bonusType, setBonusType] = useState();
  const [imageFile, setImageFile] = useState();
  const [taskLink, setTaskLink] = useState('');
  const [taskType, setTaskType] = useState(undefined);
  const [expiredDate, setExpiredDate] = useState();
  const [promotionPrice, setPromotionPrice] = useState();
  useEffect(() => {
    if (user == null) {
      history.push("/");
      return;
    }
    getPromotions();
  }, []);

  const getPromotions = () => {
    setIsLoading(true);
    axios
      .get(`${backend_api}/promotions`)
      .then((response) => {
        if (response.status == 200) {
          console.log("Scripts", response.data);
          if (response.data.success) {
            console.log(response.data.message[0]);
            setfilteredPromotionData(response.data.message);
            setPromotionData(response.data.message);
          } else
            api.info({
              message: `Server Error`,
              description: (
                <Context.Consumer>{({ }) => `Error Occured`}</Context.Consumer>
              ),
              placement: "topRight",
            });
        } else {
          api.info({
            message: `Server Error`,
            description: (
              <Context.Consumer>{({ }) => `Error Occured`}</Context.Consumer>
            ),
            placement: "topRight",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const clearPromotionFrom = () => {
    setPromotionTitle("");
    setPromotionDescription("");
    setPromotionPrice("")
    setExpiredDate(undefined)
  };

  const handleCancel = () => {
    setNewPromotionModalOpen(false);
    setDeleteScriptModalOpen(false);
    clearPromotionFrom();
  };

  const handleTypeChange = (option) => {
    setTaskType(option)
    setTaskLink("")
  }

  const handleSaveNewPromtion = () => {
    console.log(promotionPrice)
    if (promotionDescription == "" || promotionTitle == "" || expiredDate == undefined || promotionPrice == "") {
      notification.info({
        message: "Info",
        description: "Input correctly",
      });
      return;
    }
    setIsLoading(true);

    const data = {
      title: promotionTitle,
      description: promotionDescription,
      expired_date: expiredDate,
      price: promotionPrice
    }

    axios
      .post(`${backend_api}/promotion`, data)
      .then((response) => {
        if (response.status == 200) {
          console.log(response.data);
          if (response.data.success) {
            notification.success({
              message: "Success",
              description: "Successfully Created",
            });
            getPromotions();
          } else {
            notification.error({
              message: "Error",
              description: response.data.message,
            });
          }
        } else {
          notification.error({
            message: "Error",
            description: "Server Error",
          });
        }
      })
      .catch((error) => {
        notification.error({ message: "Error", description: "Server Error" });
      })
      .finally(() => {
        setIsLoading(false);
        setNewPromotionModalOpen(false);
        clearPromotionFrom();
      });
  };

  const handleSearchPromotionsChange = (e) => {
    setSearchPromotion(e.target.value);
    const searchKey = e.target.value;
    filterDataAsync(promotionData, searchKey).then((filteredData) => {
      setfilteredPromotionData(filteredData);
    });
  };

  const filterDataAsync = (data, key) => {
    return new Promise((resolve) => {
      const filteredData = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(key.toLowerCase()) || item.description?.toLowerCase().includes(key.toLowerCase()));
      resolve(filteredData);
    });
  };

  const handleDeleteButton = (record) => {
    setDeleteScriptModalOpen(true);
    setCurrentSelectedTask(record);
  };

  const handleDeleteScript = () => {
    axios
      .delete(`${backend_api}/task/${currentSelectedTask.id}`)
      .then((response) => {
        if (response.status == 200) {
          if (response.data.success) {
            notification.success({
              message: "Success",
              description: "Script deleted",
            });
            getPromotions();
          } else {
            notification.error({
              message: "Error",
              description: response.data.message,
            });
          }
        } else {
          notification.error({ message: "Error", description: "Server Error" });
        }
      })
      .catch((error) => {
        notification.error({ message: "Error", description: "Server Error" });
      })
      .finally(() => {
        setIsLoading(false);
        setDeleteScriptModalOpen(false);
      });
  };

  const promotion_columns = [

    {
      title: "Name",
      dataIndex: "title",
      key: "title",
      textWrap: "word-break",
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      textWrap: "word-break",
      ellipsis: true,
    },
    {
      title: "Expired Date",
      dataIndex: "expired_date",
      key: "expired_date",
      textWrap: "word-break",
      render: (data) => {
        return data.slice(0, 10)
      },
      ellipsis: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      textWrap: "word-break",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "expired_date",
      key: "expired_date",
      textWrap: "word-break",
      ellipsis: true,
      render: (expiredDate, record) => {
        const isExpired = new Date(expiredDate) > new Date();
        return (
          <Space size="small">
            <div style={{ whiteSpace: "wrap", width: "100px", color: isExpired ? 'hsl(102, 53%, 61%)' : '#fa541c'}}>
              {isExpired ? "Active" : "Ended"}
            </div>
          </Space>
        );
      },
    },
    // {
    //   title: "Delete",
    //   render(_, record) {
    //     return (
    //       <div>
    //         <Button
    //           type="link"
    //           danger
    //           onClick={(e) => handleDeleteButton(record)}
    //           size="small"
    //         >
    //           Delete
    //         </Button>
    //       </div>
    //     );
    //   },
    //   width: "70px",
    //   align: "top",
    // },
  ];

  const contextValue = useMemo(
    () => ({
      name: "Ant Design",
    }),
    []
  );

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <div className="layout-content">
        <Row>
          <Col span={24}>
            <Card title="Promotions">
              <Row justify="space-between" style={{ marginBottom: "10px" }}>
                <Col md={6}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setNewPromotionModalOpen(true);
                      setModalTitle("Add New Promotion");
                    }}
                  >
                    <PlusOutlined />
                    Add New
                  </Button>
                </Col>
                <Col md={6}>
                  <Input
                    prefix={<SearchOutlined />}
                    size="small"
                    placeholder="Search"
                    value={searchPromotion}
                    onChange={(e) => handleSearchPromotionsChange(e)}
                  />
                </Col>
              </Row>
              <Table
                columns={promotion_columns}
                dataSource={filteredPromotionData}
                scroll={{ x: true }}
                rowKey={(record) => record.id}
                loading={isLoading}
                pagination={true}
                bordered
                size="small"
              />
            </Card>
          </Col>
        </Row>
        <Modal
          title={modalTitle}
          visible={newPromotionModalOpen}
          onOk={handleSaveNewPromtion}
          confirmLoading={isLoading}
          onCancel={handleCancel}
          width={1000}
        >
          <Row justify="center" style={{ marginTop: "20px" }}>
            <Col span={24}>
              <Form layout="vertical" className="row-col">
                <Row style={{ marginBottom: "20px" }} gutter={50}>
                  <Col span={8}>
                    <p>Title</p>
                    <Input
                      placeholder="Promotion Title"
                      onChange={(e) => {
                        setPromotionTitle(e.target.value);
                      }}
                      value={promotionTitle}
                    />
                  </Col>
        
                  <Col span={8}>
                    <p>Price</p>
                    <Input
                      placeholder="Price"
                      onChange={(e) => {
                        setPromotionPrice(e.target.value);
                      }}
                      value={promotionPrice}
                      type="number"
                    />
                  </Col>
                  <Col span={8}>
                    <p>Expired Date</p>
                    <DatePicker
                        onChange={(_, dateString) => {
                          setExpiredDate(`${dateString}:00`);
                        }}
                        value={
                          modalTitle == "Add New Promotion"
                            ? undefined
                            : dayjs(expiredDate)
                        }
                        allowClear={true}
                        format="YYYY-MM-DD"
                        size="large"
                        style={{width: '100%'}}
                      />
                  </Col>
                </Row>
                <Row style={{ marginBottom: "20px" }} gutter={50}>
                <Col span={24}>
                    <p>Description</p>
                    <Input
                      placeholder="Description"
                      onChange={(e) => {
                        setPromotionDescription(e.target.value);
                      }}
                      value={promotionDescription}
                    />
                  </Col>
                </Row>

              </Form>
            </Col>
          </Row>
        </Modal>

        <Modal
          title="Delete Task"
          visible={deleteScriptModalOpen}
          onOk={handleDeleteScript}
          confirmLoading={isLoading}
          onCancel={handleCancel}
        >
          <h3>Are you sure?</h3>
        </Modal>
      </div>
    </Context.Provider>
  );
}

export default Promotion;
