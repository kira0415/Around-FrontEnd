import React, { Component } from 'react'
import { Modal, Button } from 'antd';

import CreatePostForm from './CreatePostForm';
import { TOKEN_KEY, API_ROOT, AUTH_HEADER, POS_KEY } from '../constants';

class CreatePostButton extends Component {
    state = { 
        visible: false,
        confirmLoading: false
     };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    this.form.validateFields((err, values) => {
        if (!err) {
            console.log('Received values of form: ', values);

            const token = localStorage.getItem(TOKEN_KEY);
            const {lat, lon} = JSON.parse(localStorage.getItem(POS_KEY));

            const formData = new FormData();
            formData.set('lat', lat);
            formData.set('lon', lon);
            formData.set('message', values.message);
            formData.set('image', values.image[0].originFileObj);

            this.setState({
                confirmLoading: true
            });

            fetch(`${API_ROOT}/post`, {
                method: 'POST',
                headers: {
                    Authorization: `${AUTH_HEADER} ${token}`,
                },
                body: formData
            })
            .then(response => {
                if(response.ok) {
                    return "OK"
                }
                throw new Error('failed in uploading')
            })
            .then(data => {
                console.log("uploading ok");
                this.setState({
                    visible: false,
                    confirmLoading: false
                });
                this.forceUpdate.resetFields();
            })
            .catch( err => {
                console.log(err);
                this.setState({ confirmLoading: false });
            })
        }
    })
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  getFormRef = (formInstance) => {
      this.form = formInstance;
  }

  render() {
      const { confirmLoading, visible } = this.state;
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Create New Post
        </Button>
        <Modal
          title="Create New Post"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={confirmLoading}
          okText="Create"
        >
            <CreatePostForm ref={this.getFormRef}/>
        </Modal>
      </div>
    );
  }
}

export default CreatePostButton;