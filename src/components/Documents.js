import React, { Component } from 'react';
import styled from 'styled-components';
import { 
    Container, 
    Row, 
    Col, 
    Button, 
    InputGroup, 
    Dropdown, 
    ButtonGroup, 
    ProgressBar, 
    Toast, 
    Card,
    CardGroup,
    CardColumns
} from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    setDocumentIndex,
    setDocumentSortType,
    setDocumentOrder,
    setDocumentSelectAll,
    setDocumentProgressBar,
    setDocumentDownloading,
    setDocumentAlert,
    setDocumentAlertFile,
    setDocumentSelected,
    setDocumentAlertAction,
    setDocumentAlertActionForAll
} from '../redux/actions/document'


const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const MainContainerStyle = styled.div`
  * {
    box-sizing: border-box
  }
`

const TopBarStyle = styled.div`

    position: sticky;
    top:0;
    z-index: 1000;

    .col {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .row {
        z-index: 1000;
        background-color: white;
        border-bottom: 2px solid black;
    }

`
const ContentStyle = styled.div`
    .col {
        flex: 25%;
        padding: 10px;
    }

`

const DownloadingStyle = styled.div`
    
`

class Documents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectAll: false,
            documents: [],
            isLoading: false,
            index: 1,
            noOfDocuments: 0,
            downloading: false,
            indexArray: [],
            order: true,
            sortType: 0,
            selected: [],
            alertAction: null,
            alertActionForAll: false,
            deviceConnected: true
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        })
        ipcRenderer.send('get-documents', this.props.document.index*30 -30);
        ipcRenderer.on('device-not-connected', (event) => {
            this.setState({
                deviceConnected: false
            })
        })
        ipcRenderer.on('no-of-documents', (event, arg) => {
            var temp = [];
            var index = this.props.document.index;
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < arg)
                    temp.push(i);
                else
                    break;
            }
            this.setState({
                noOfDocuments: arg,
                indexArray: temp
            });
        })
        ipcRenderer.on('documents', (event, arg) => {
            this.setState({
                documents: arg,
                index: this.props.document.index,
                order: this.props.document.order,
                sortType: this.props.document.sortType,
                selectAll: this.props.document.selectAll,
                downloading: this.props.document.downloading,
                selected: this.props.document.selected,
                alertAction: this.props.document.alertAction,
                alertActionForAll: this.props.document.alertActionForAll,
                isLoading: false
            });
        });
        
        ipcRenderer.on('reset', (event) => {
            this.props.setDocumentIndex(1);
            this.props.setDocumentSortType(0);
            this.props.setDocumentOrder(true);
            this.props.setDocumentSelectAll(false);
            this.props.setDocumentProgressBar(0);
            this.props.setDocumentDownloading(false);
            this.props.setDocumentAlert(false);
            this.props.setDocumentAlertFile('');
            this.props.setDocumentSelected([]);
            this.props.setDocumentAlertAction(null);
            this.props.setDocumentAlertActionForAll(false);

            this.setState({
                documents: [],
                index: 1,
                sortType: 0,
                order: true,
                selectAll: false,
                downloading: false,
                selected: [],
                alertAction: null,
                alertActionForAll: false,
                deviceConnected: true,
            })
        })
    }

    tryAgain = () => {
        ipcRenderer.send('get-documents', this.props.document.index*30 -30);
        this.setState({
            deviceConnected: true
        })
    }

    setOrder = (arg) => {
        this.props.setDocumentOrder(arg);
        this.setState({
            order: arg
        })
    }

    setSortType = (arg) => {
        this.props.setDocumentSortType(arg);
        this.setState({
            sortType: arg
        })
    }

    sort = () => {
        this.setState({
            isLoading: true
        })
        const {
            sortType,
            order
        } = this.state;

        if (sortType===0) {
            ipcRenderer.send('document-sort-by-name', order);
        } else if (sortType===1) {
            ipcRenderer.send('document-sort-by-size', order);
        } else {
            ipcRenderer.send('document-sort-by-last-modified', order);
        }

        ipcRenderer.once('document-sorted', (event) => {
            const index = 1;
            const noOfDocuments = this.state.noOfDocuments;
            ipcRenderer.send('get-more-documents', index*30 -30);
            ipcRenderer.once('more-documents', (event, arg) => {
                var temp = [];
                for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                    if ((i*30 -30) < noOfDocuments)
                        temp.push(i);
                    else
                        break;
                }
                this.props.setDocumentIndex(index);
                this.setState({
                    documents: arg,
                    index: index,
                    indexArray: temp,
                    isLoading: false
                });
            });
        })
    }

    next = () => {
        this.setState({
            isLoading: true
        });
        const index = this.state.index + 1;
        const noOfDocuments = this.state.noOfDocuments;
        ipcRenderer.send('get-more-documents', index*30 -30);
        ipcRenderer.once('more-documents', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < noOfDocuments)
                    temp.push(i);
                else
                    break;
            }
            this.props.setDocumentIndex(index);
            this.setState({
                documents: arg,
                index: index,
                indexArray: temp,
                isLoading: false
            });
        });
    }

    prev = () => {
        this.setState({
            isLoading: true
        })
        const index = this.state.index - 1;
        const noOfDocuments = this.state.noOfDocuments;
        ipcRenderer.send('get-more-documents', index*30 -30)
        ipcRenderer.once('more-documents', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < noOfDocuments)
                    temp.push(i);
                else
                    break;
            }
            this.props.setDocumentIndex(index);
            this.setState({
                documents: arg,
                index: index,
                indexArray: temp,
                isLoading: false
            });
        });
    }

    setDocuments = (index) => {
        this.setState({
            isLoading: true
        })
        const noOfDocuments = this.state.noOfDocuments;
        ipcRenderer.send('get-more-documents', (index*30)-30)
        ipcRenderer.once('more-documents', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < noOfDocuments)
                    temp.push(i);
                else
                    break;
            }
            this.props.setDocumentIndex(index);
            this.setState({
                documents: arg,
                indexArray: temp,
                index: index,
                isLoading: false
            });
        });
    }

    selectDocument = (i) => {
        //console.log("key-"+i);
        const doc = document.getElementById("key-"+i);
        //console.log(doc.style.opacity);
        if (doc.style.opacity==0.5) {
            let {
                selected
            } = this.state;
            selected.splice(selected.indexOf(this.state.documents[i]), 1);
            doc.style.opacity=1;
            this.props.setDocumentSelected(selected);
            this.props.setDocumentSelectAll(false);
            this.setState({
                selected,
                selectAll: false
            })
        } else {
            let {
                selected
            } = this.state;
            selected.push(this.state.documents[i]);
            doc.style.opacity=0.5;
            this.props.setDocumentSelected(selected);
            this.setState({
                selected
            })
        }
    }

    selectAllChange = () => {
        let selected = [];
        if (this.state.selectAll) {
            this.props.setDocumentSelected(selected);
            this.props.setDocumentSelectAll(false)
            this.setState({
                selectAll: false,
                selected
            })
        } else {
            ipcRenderer.send('get-array-of-documents');
            ipcRenderer.once('array-of-documents', (event, arg) => {
                this.props.setDocumentSelected(arg);
                this.props.setDocumentSelectAll(true)
                this.setState({
                    selected: arg,
                    selectAll: true
                })
            })
        }
    }

    unselectAll = () => {
        this.props.setDocumentSelected([]);
        this.props.setDocumentSelectAll(false)
        this.setState({
            selected: [],
            selectAll: false
        })
    }

    download = () => {
        ipcRenderer.send('document-download', this.state.selected);
        this.props.setDocumentDownloading(true);
        this.setState({
            downloading: true
        })
    }

    closeDownload = () => {
        this.props.setDocumentProgressBar(0);
        this.props.setDocumentDownloading(false);
        this.props.setDocumentSelectAll(false);
        this.props.setDocumentSelected([]);
        this.props.setDocumentAlertAction(null);
        this.props.setDocumentAlertActionForAll(false);
        this.setState({
            downloading: false,
            selectAll: false,
            selected: [],
            alertAction: null,
            alertActionForAll: false
        });
    }

    setAlertActionForAll = () => {
        this.props.setDocumentAlertActionForAll(!this.state.alertActionForAll);
        this.setState({
            alertActionForAll: !this.state.alertActionForAll
        });
    }

    autoAction = () => {
        this.props.setDocumentAlert(false);
        this.props.setDocumentAlertFile('');
        ipcRenderer.send('document-overwrite', this.state.alertAction);
    }

    selectAlert = (bool) => {
        if (this.state.alertActionForAll) {
            this.props.setDocumentAlert(false);
            this.props.setDocumentAlertFile('');
            this.props.setDocumentAlertAction(bool);
            this.setState({
                alertAction: bool
            });
            ipcRenderer.send('document-overwrite', bool);
        } else {
            this.props.setDocumentAlert(false);
            this.props.setDocumentAlertFile('');
            ipcRenderer.send('document-overwrite', bool);
        }
        
    }

    render() {

        const {
            selectAll,
            documents,
            isLoading,
            noOfDocuments,
            downloading,
            indexArray,
            index,
            sortType,
            order,
            selected,
            alertActionForAll,
            alertAction,
            deviceConnected
        } = this.state;

        const {
            alert,
            alertFile,
            progressBar
        } = this.props.document;

        if (!deviceConnected) {
            return (
                <>
                    <h1>
                        Device Not Connected
                        <Button variant="outline-danger" onClick={this.tryAgain}>
                            Try Again
                        </Button>
                    </h1>
                </>
            )
        }

        if (isLoading||documents.length===0) {
            return (
                <h1 style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    Loading...
                </h1>
            );
        }

        return (
            <MainContainerStyle>
                <Container fluid>
                    <TopBarStyle>
                        <Row>
                            <Col>
                                <InputGroup>
                                    <InputGroup.Prepend style={{marginLeft: 'auto'}}>
                                        <InputGroup.Text>Select All</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <InputGroup.Append style={{marginRight: 'auto'}}>
                                        <InputGroup.Checkbox checked={selectAll} onChange={this.selectAllChange} />
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>
                            <Col>
                                <InputGroup>
                                    <Button
                                        style={{marginLeft: 'auto', marginRight: 'auto'}} 
                                        onClick={this.unselectAll} 
                                        variant="light"
                                    >
                                        Unselect ALL ({selected.length})
                                    </Button>
                                </InputGroup>
                            </Col>
                            <Col>
                                <Dropdown as={ButtonGroup}>
                                    <Button onClick={this.sort} variant="light">Sort</Button>

                                    <Dropdown.Toggle split variant="light" id="sort-split" />

                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            active={(sortType===0)?(true):(false)}
                                            onClick={() => this.setSortType(0)}
                                        >
                                            Name
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={(sortType===1)?(true):(false)}
                                            onClick={() => this.setSortType(1)}
                                        >
                                            Size
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={(sortType===2)?(true):(false)}
                                            onClick={() => this.setSortType(2)}
                                        >
                                            Date Modified
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item
                                            active={(order)?(true):(false)} 
                                            onClick={() => this.setOrder(true)}
                                        >
                                            Accending
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={(!order)?(true):(false)}
                                            onClick={() => this.setOrder(false)}
                                        >
                                            Deccending
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                            <Col>
                                <Button variant="light" onClick={this.download}>Download</Button>
                            </Col>
                        </Row>
                    </TopBarStyle>
                    {
                        (!downloading)? (
                            <ContentStyle>
                                <Row>
                                    <Col>
                                        <CardColumns>
                                        {
                                            documents.map((document, i) => {
                                                //console.log(Documents);
                                                var name = document.replace(/^.*[\\\/]/, '');
                                                var key = 'key-' + i;
                                                //console.log(key);
                                                return (
                                                    <Card
                                                        id={key}
                                                        key={key} 
                                                        bg="info"
                                                        onClick={() => this.selectDocument(i)}
                                                        style={{opacity: (selected.includes(document)?('0.5'):(1))}}
                                                    >
                                                        <Card.Body>{name}</Card.Body>
                                                    </Card>
                                                );
                                            })
                                        }
                                        </CardColumns>
                                    </Col> 
                                </Row>
                                <Row>
                                    <InputGroup>
                                        <InputGroup.Prepend style={{marginLeft: 'auto'}}>
                                            <Button 
                                                variant="outline-danger" 
                                                onClick={this.prev}
                                                disabled={(index===1)?(true):(false)}
                                            >
                                                Prev
                                            </Button>
                                        </InputGroup.Prepend>
                                        <ButtonGroup>
                                            {
                                                indexArray.map((arg, i) => {
                                                    return (
                                                        <Button 
                                                            key={i} 
                                                            active={(index===arg)?(true):(false)} 
                                                            variant="outline-danger" 
                                                            onClick={() => this.setDocuments(arg)}
                                                        >
                                                            {arg}
                                                        </Button>
                                                    );
                                                })
                                            }
                                        </ButtonGroup>
                                        <InputGroup.Append style={{marginRight: 'auto'}}>
                                            <Button 
                                                variant="outline-danger" 
                                                onClick={this.next}
                                                disabled={((index*30)>=noOfDocuments)?(true):(false)}
                                            >
                                                Next
                                            </Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Row>    
                            </ContentStyle> 
                        ) : (
                            <DownloadingStyle>
                                <Row>
                                    <Col>
                                        <ProgressBar
                                            style={{width: '100%'}} 
                                            now={Math.round((progressBar/selected.length)*100)} 
                                            label={`${Math.round((progressBar/selected.length)*100)}`} 
                                        />
                                        {
                                            (progressBar===selected.length)? (
                                                <>
                                                    <h2>
                                                        Download Complete
                                                    </h2>
                                                    <Button 
                                                        variant="outline-danger"
                                                        onClick={this.closeDownload}
                                                    >
                                                        Close
                                                    </Button>  
                                                </>
                                            ):(null)
                                        }
                                        {
                                            (alert) ? (
                                                (alertActionForAll&&alertAction!=null) ? (
                                                    this.autoAction()
                                                ) : (
                                                    <Toast>
                                                        <Toast.Header>
                                                            <strong>{alertFile} already exists in destination</strong>
                                                        </Toast.Header>
                                                        <Toast.Body>
                                                            <p>OverWrite</p>
                                                            <Button onClick={() => this.selectAlert(true)}>Yes</Button>
                                                            <Button onClick={() => this.selectAlert(false)}>No</Button>
                                                            <InputGroup>
                                                                <InputGroup.Prepend>
                                                                    <InputGroup.Checkbox checked={alertActionForAll} onChange={this.setAlertActionForAll} />
                                                                </InputGroup.Prepend>
                                                                <InputGroup.Append>
                                                                    <InputGroup.Text>Do it for all?</InputGroup.Text>
                                                                </InputGroup.Append>
                                                            </InputGroup>
                                                        </Toast.Body>
                                                    </Toast>
                                                )
                                            ) : (null)
                                        }
                                    </Col>
                                </Row>
                            </DownloadingStyle>
                        )
                    }
                </Container>
            </MainContainerStyle>
        );
    }
}

function mapStateToProps(state) {
    return {
        document: state.document
    }
}

export default connect(mapStateToProps, { 
    setDocumentIndex, 
    setDocumentSortType, 
    setDocumentOrder,
    setDocumentSelectAll,
    setDocumentProgressBar,
    setDocumentDownloading,
    setDocumentAlert,
    setDocumentAlertFile,
    setDocumentSelected,
    setDocumentAlertAction,
    setDocumentAlertActionForAll 
})(Documents);