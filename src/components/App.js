import React, { Component } from 'react';
import styled from 'styled-components';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    setImageProgressBar,
    setImageAlert,
    setImageAlertFile,
} from '../redux/actions/image';

import {
  setDocumentProgressBar,
  setDocumentAlertFile,
  setDocumentAlert
} from '../redux/actions/document';
import Images from './Images';
import Documents from './Documents';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


const MainContainerStyle = styled.div`

  display: flex;
  flex-wrap: wrap;

  * {
    box-sizing: border-box
  }
  
  .col-md-2, .col-md-10 {
    padding-left: 0px;
    padding-right: 0px;
  }

  .col-md-2 {
    border-right: 2px solid black;
    position: sticky;
    z-index: 1000;
    align-self: flex-start;
    top: 0;
    left: 0;
  }
`
const SideMenuStyle = styled.div`
  height: 100vh;

  h2 {
    margin-top: 10%;
    text-align: center;
    margin-bottom: 10%;
  }

  .col {
    padding-left: 0px;
    padding-right: 0px;
  }

  .btn {
    display: block;
    width: 100%;
    height: 100%;
  }

`

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle_tab: true
    }
  }

  componentDidMount() {
    ipcRenderer.on('image-downloaded-file-id', (event, arg) => {
      this.props.setImageProgressBar(arg);
    })
    ipcRenderer.on('image-file-exist', (event, arg) => {
      this.props.setImageAlert(true);
      this.props.setImageAlertFile(arg.replace(/^.*[\\\/]/, ''));
    })
    ipcRenderer.on('document-downloaded-file-id', (event, arg) => {
      this.props.setDocumentProgressBar(arg);
    })
    ipcRenderer.on('document-file-exist', (event, arg) => {
      this.props.setDocumentAlert(true);
      this.props.setDocumentAlertFile(arg.replace(/^.*[\\\/]/, ''));
    })
  }

  toggleImages = () => {
    this.setState({
      toggle_tab: true
    });
  }

  toggleDocuments = () => {
    this.setState({
      toggle_tab: false
    });
  }

  render() {

    const {
      toggle_tab
    } = this.state;

    return (
      <MainContainerStyle>
        <Container fluid>
          <Row>
            <Col md={2}>
              <SideMenuStyle>  
                <Container>
                  <Row>
                    <Col rowSpan={2}>
                      <h2>Backup</h2>
                    </Col>
                  </Row>
                  <br/>
                  <br/>
                  <Row>
                    <Col>
                      <Button variant="light" onClick={this.toggleImages}>
                        Images
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button variant="light" onClick={this.toggleDocuments}>
                        Documents
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </SideMenuStyle>
            </Col>
            <Col md={10}>
              {
                (toggle_tab)? (
                  <Images />
                ):(
                  <Documents />
                )
              }
            </Col>
          </Row>
        </Container>
      </MainContainerStyle>
    );
  }
}

function mapStateToProps(state) {
  return {
      image: state.image
  }
}

export default connect(mapStateToProps, { 
  setImageProgressBar,
  setImageAlert,
  setImageAlertFile,
  setDocumentProgressBar,
  setDocumentAlertFile,
  setDocumentAlert
})(App);
