import {
  Col,
  Divider,
  Form,
  InputNumber,
  Row,
  Select,
  notification,
} from "antd";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./App.scss";

const App = () => {
  const [form] = Form.useForm();

  const [isRequest, setIsRequest] = useState(true);
  const [prices, setPrices] = useState([]);

  const [fromPrices, setFromPrice] = useState([]);
  const [toPrices, setToPrice] = useState([]);

  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    fetch("https://interview.switcheo.com/prices.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json();
      })
      .then((data) => {
        setIsRequest(false);
        setPrices(formatData(data));
      })
      .catch(() => {
        setIsRequest(false);
        notification["error"]({
          description: "An error occurred! Please reload the page",
        });
      });
  }, []);

  useEffect(() => {
    if (fromPrices.length === 1) {
      form.setFieldValue("fromprice", fromPrices[0].price ?? 0);
    }
    onChangePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPrices]);

  useEffect(() => {
    if (toPrices.length === 1) {
      form.setFieldValue("toprice", toPrices[0].price ?? 0);
    }
    onChangePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toPrices]);

  const CURRENCY_OPTIONS = prices.map((price) => ({
    value: price.currency,
    label: price.currency,
  }));

  const formatData = (data) => {
    //remove duplicate currency
    const uniqueArray = data.reduce((arr, current) => {
      const x = arr.find((item) => item.currency === current.currency);
      if (!x) {
        return arr.concat([current]);
      } else {
        return arr;
      }
    }, []);

    uniqueArray.forEach((item) => {
      //get children item
      item.children = data.filter((price) => price.currency === item.currency);

      //remove duplicate price
      item.children = item.children.reduce((arr, current) => {
        const x = arr.find((item) => item.price === current.price);
        if (!x) {
          return arr.concat([current]);
        } else {
          return arr;
        }
      }, []);
    });

    return uniqueArray;
  };

  const onChangeFromCurrency = (e) => {
    setFromPrice(prices.find((price) => price.currency === e)?.children ?? []);
    form.resetFields(["fromprice"]);
  };

  const onChangeToCurrency = (e) => {
    setToPrice(prices.find((price) => price.currency === e)?.children ?? []);
    form.resetFields(["toprice"]);
  };

  const currencyConvert = (e, fromPrice, toPrice) => {
    return !toPrice ? 0 : (e * fromPrice) / toPrice;
  };

  const onChangeFromInput = (e) => {
    const fromPrice = +(form.getFieldValue("fromprice") ?? 0);
    const toPrice = +(form.getFieldValue("toprice") ?? 0);
    form.submit();

    if (!fromPrice || !toPrice) {
      return;
    }

    form.setFieldValue("to", currencyConvert(e, fromPrice, toPrice));
  };

  const onChangeToInput = (e) => {
    const fromPrice = +(form.getFieldValue("toprice") ?? 0);
    const toPrice = +(form.getFieldValue("fromprice") ?? 0);
    form.submit();

    if (!fromPrice || !toPrice) {
      return;
    }

    form.setFieldValue("from", currencyConvert(e, fromPrice, toPrice));
  };

  const onChangePrice = () => {
    const fromPrice = +(form.getFieldValue("fromprice") ?? 0);
    const toPrice = +(form.getFieldValue("toprice") ?? 0);
    const from = +(form.getFieldValue("from") ?? 0);

    setExchangeRate(currencyConvert(1, fromPrice, toPrice));

    if (!from || !fromPrice || !toPrice) {
      form.resetFields(["to"]);
      return;
    }

    form.setFieldValue("to", currencyConvert(from, fromPrice, toPrice));
  };

  return (
    <div>
      {isRequest && (
        <div className="wrapper-loading">
          <div className="loading" />
        </div>
      )}

      <Row className="main-layout">
        <Col xl={10} lg={8} md={24} sm={24} xs={24}>
          {!isRequest && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                duration: 0.5,
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{ scale: 1.2 }}
              className="box-text"
            >
              <div className="title">CURRENCY CONVERTER</div>
            </motion.div>
          )}
        </Col>

        <Col xl={14} lg={16} md={24} sm={24} xs={24}>
          <Form form={form} layout="vertical" className="w-100">
            {!isRequest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "spring",
                  duration: 0.5,
                  delay: 0.5,
                  stiffness: 200,
                  damping: 20,
                }}
                className="box-converter"
              >
                <Divider orientation="left">From</Divider>
                <Row gutter={[16, 0]} className="w-100">
                  <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                    <Form.Item
                      name="fromcurrency"
                      label="Currency"
                      rules={[{ required: true, message: "Please choose one" }]}
                    >
                      <Select
                        showSearch
                        options={CURRENCY_OPTIONS}
                        onChange={onChangeFromCurrency}
                        placeholder="Choose currency ..."
                      />
                    </Form.Item>
                  </Col>

                  <Col xl={16} lg={16} md={16} sm={16} xs={24}>
                    <Form.Item
                      name="fromprice"
                      label="Price"
                      rules={[{ required: true, message: "Please choose one" }]}
                    >
                      <Select
                        onChange={onChangePrice}
                        disabled={fromPrices.length === 1}
                        options={fromPrices.map((price) => ({
                          value: price.price,
                          label: price.price,
                        }))}
                        placeholder="Choose currency then choose price ..."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">To</Divider>
                <Row gutter={[16, 0]} className="w-100">
                  <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                    <Form.Item
                      name="tocurrency"
                      label="Currency"
                      rules={[{ required: true, message: "Please choose one" }]}
                    >
                      <Select
                        showSearch
                        options={CURRENCY_OPTIONS}
                        onChange={onChangeToCurrency}
                        placeholder="Choose currency ..."
                      />
                    </Form.Item>
                  </Col>

                  <Col xl={16} lg={16} md={16} sm={16} xs={24}>
                    <Form.Item
                      name="toprice"
                      label="Price"
                      rules={[{ required: true, message: "Please choose one" }]}
                    >
                      <Select
                        onChange={onChangePrice}
                        disabled={toPrices.length === 1}
                        options={toPrices.map((price) => ({
                          value: price.price,
                          label: price.price,
                        }))}
                        placeholder="Choose currency then choose price ..."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {!form.getFieldValue("fromcurrency") ||
                !form.getFieldValue("tocurrency") ? (
                  <></>
                ) : (
                  <div className="exchange-rate-text">
                    <i>
                      (Exchange rate: 1 {form.getFieldValue("fromcurrency")}{" "}
                      {"-->"} {exchangeRate} {form.getFieldValue("tocurrency")})
                    </i>
                  </div>
                )}

                <Divider orientation="left">Converter</Divider>
                <Row gutter={[16, 16]} className="w-100">
                  <Col span={24}>
                    <div className="result">
                      <p>{form.getFieldValue("fromcurrency") ?? "FROM"}:</p>
                      <Form.Item name="from">
                        <InputNumber
                          onChange={onChangeFromInput}
                          className="w-100"
                        />
                      </Form.Item>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div className="result">
                      <p>{form.getFieldValue("tocurrency") ?? "TO"}:</p>
                      <Form.Item name="to">
                        <InputNumber
                          onChange={onChangeToInput}
                          className="w-100"
                        />
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </motion.div>
            )}
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default App;
