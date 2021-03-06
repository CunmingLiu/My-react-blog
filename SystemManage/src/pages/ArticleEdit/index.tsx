import React, { useState, useEffect } from 'react';
import {
  Input,
  Row,
  Col,
  Button,
  Breadcrumb,
  Spin,
  message,
  Upload,
  Icon,
} from 'antd';
import marked from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import '../Article/index.less';
import { articleDetailApi, articleUpdateApi } from '@/services/articleList';
import { Link } from 'umi';
import { CDN, UPLOADURL } from '@/utils/constants';
import { IRouteComponentProps } from '@/models/connect';

const ArticleEdit = (props: IRouteComponentProps) => {
  const [text, setText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [avatar, setAvatar] = useState<string>('');

  useEffect(() => {
    const div = document.getElementById('contentdiv');
    div!.scrollTop = div!.scrollHeight;
    setLoad(true);
    const { _id = '' }: any = props.location.query;
    articleDetailApi({ _id }).then(res => {
      if (res?.success && res.result.length > 0) {
        setLoad(false);
        setText(res.result[0].content);
        setTitle(res.result[0].title);
        setInfo(res.result[0].info);
        setType(res.result[0].type);
        setAvatar(res.result[0].img);
        setFileList([
          {
            uid: '-1',
            name: 'old.png',
            status: 'done',
            url: res.result[0].img,
          },
        ]);
      }
    });
  }, []);
  const renderer = new marked.Renderer();

  marked.setOptions({
    renderer: renderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    },
  });

  const TextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setText(e.target.value);
  const titleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const infoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setInfo(e.target.value);
  const typeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setType(e.target.value);

  const uploadChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = `${CDN}${file?.response?.data?.data?.key ?? ''}`;
      }
      return file;
    });
    if (info.file.status === 'done') {
      const { response } = info.file;
      setAvatar(`${CDN}${response?.data?.data?.key ?? ''}`);
      message.success(`${info.file.name} ????????????`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} ????????????`);
    }
    setFileList(fileList);
  };

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('????????????????????????JPG/PNG');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('????????????2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleSubmit = () => {
    if (!title) {
      message.error('????????????????????????');
      return;
    }
    if (!type) {
      message.error('????????????????????????');
      return;
    }
    if (!avatar) {
      message.error('????????????????????????');
      return;
    }
    if (!info) {
      message.error('????????????????????????');
      return;
    }
    if (!text) {
      message.error('????????????????????????');
      return;
    }
    setLoad(true);
    const { _id = '' }: any = props.location.query;
    articleUpdateApi({
      _id,
      update: {
        title,
        info,
        content: text,
        type,
        img: avatar,
        editDate: +new Date(),
      },
    }).then(res => {
      if (res?.success) {
        message.success('????????????');
        setLoad(false);
        props.history.push('/articlelist');
      }
    });
  };
  return (
    <Spin size="large" spinning={load}>
      <div
        style={{
          background: '#fff',
          margin: 20,
          padding: 20,
          borderRadius: 5,
          border: '1px solid #ccc',
        }}
      >
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item>??????</Breadcrumb.Item>
            <Breadcrumb.Item>????????????</Breadcrumb.Item>
          </Breadcrumb>
        </Row>
        <Row style={{ marginTop: 20, marginBottom: 20 }}>
          <h1>????????????</h1>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col span={8}>
            <p style={{ marginBottom: 5 }}>???????????? :</p>
            <Input
              value={title}
              onChange={titleChange}
              placeholder="????????????"
            />
          </Col>
          <Col span={1}></Col>

          <Col span={15} style={{ textAlign: 'right', paddingTop: 25 }}>
            <Button
              type="primary"
              onClick={handleSubmit}
              style={{ marginRight: 20 }}
            >
              ??????
            </Button>
            <Button>
              <Link to="/articlelist">??????</Link>
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col span={8}>
            <p style={{ marginBottom: 5 }}>???????????? :</p>
            <Input value={type} onChange={typeChange} placeholder="????????????" />
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col span={8}>
            <p style={{ marginBottom: 5 }}>???????????? :</p>
            <Upload
              name="file"
              action={UPLOADURL}
              headers={{
                authorization: 'authorization-text',
              }}
              onChange={uploadChange}
              beforeUpload={beforeUpload}
              fileList={fileList}
            >
              <Button>
                <Icon type="upload" /> ??????
              </Button>
            </Upload>
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col span={17}>
            <p style={{ marginBottom: 5 }}>???????????? :</p>
            <Input.TextArea
              value={info}
              onChange={infoChange}
              placeholder="????????????"
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <p style={{ marginBottom: 5 }}>???????????? :</p>
            <Input.TextArea
              style={{ height: 500, background: '#f8f9fa' }}
              value={text}
              onChange={TextChange}
              placeholder="MarkDown"
            />
          </Col>
          <Col span={12} style={{ paddingLeft: 10 }}>
            <p style={{ marginBottom: 5 }}>MarkDown :</p>
            <div
              id="contentdiv"
              style={{
                border: '1px solid #ccc',
                borderRadius: 5,
                height: 500,
                padding: '5px 10px',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: marked(text) }}
            ></div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};
export default ArticleEdit;
