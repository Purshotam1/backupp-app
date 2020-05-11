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
    Table,
    Spinner
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
    setDocumentAlertActionForAll,
    setDocumentReset
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
    z-index: 1001;

    .col {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .row {
        background-color: #3a7e9a;
        border-bottom: 2px solid white;
    }

    .input-group-text {
        background-color: #3a7e9a;
        border: none;
        color: white;
    }

    .checkbox span {
        padding: 0 0;
    }

    .unselect {
        margin-left: auto; 
        margin-right: auto;
        background-color: #3a7e9a;
        border: none;
        color: white;
        :hover {
            background-color: #dae0e5;
            color: #212529;
        }
    }

    .dropdown button {
        background-color: #3a7e9a;
        border: none;
        color: white;
        :hover {
            background-color: #dae0e5;
            color: #212529;
        }
    }

    .dropdown-menu {
        background-color: #dae0e5;
    }

    .download {
        background-color: #3a7e9a;
        border: none;
        color: white;
        :hover {
            background-color: #dae0e5;
            color: #212529;
        }
    }

`
const ContentStyle = styled.div`
    .table {
        margin: 10px
    }

    .dropdown button {
        background-color: #3a7e9a;
        border: none;
        color: white;
        :hover {
            background-color: #dae0e5;
            color: #212529;
        }
    }

    .directory-dropdown {
        height: 50vh;
        overflow: auto;
        background-color: #dae0e5;
    }
`

const DownloadingStyle = styled.div`
    .progress-bar {
        background-color: #212529;
    }

    .toast-body p {
        color: #212529;
    }

    .toast-body button {
        margin: 5px;
    }
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
            currentDevice: '',
            currentDirectory: '',
            childDirectories: [],
            downloadOption: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
            index: this.props.document.index,
            order: this.props.document.order,
            sortType: this.props.document.sortType,
            selectAll: this.props.document.selectAll,
            downloading: this.props.document.downloading,
            selected: this.props.document.selected,
            alertAction: this.props.document.alertAction,
            alertActionForAll: this.props.document.alertActionForAll,
        })
        ipcRenderer.send('get-documents', this.props.document.index*30 -30);
        ipcRenderer.once('current-directory', (event, arg) => {
            this.setState({
                currentDevice: arg.currentDevice,
                currentDirectory: arg.parent,
                childDirectories: arg.childs
            })
        })
        ipcRenderer.once('no-of-documents', (event, arg) => {
            var index = this.props.document.index;
            this.setIndexArray(index, arg);
            if (arg==0) {
                this.setState({
                    isLoading: false
                })
            }
        })
        ipcRenderer.removeAllListeners('documents');
        ipcRenderer.on('documents', (event, arg) => {
            //console.log(arg);
            this.setState({
                documents: arg,
                isLoading: false
            });
        });
    }

    previousDir = () => {
        this.setState({
            isLoading: true,
        })
        this.props.setDocumentReset();
        this.props.setDocumentOrder(this.state.order);
        this.props.setDocumentSortType(this.state.sortType);
        ipcRenderer.send('change-document-directory', {
            isChild: false
        });
        ipcRenderer.once('document-directory-changed', (event, arg) => {
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
                if (arg.isEmpty) {
                    this.setState({
                        isLoading: false
                    })
                } else {
                    ipcRenderer.send('get-documents', this.props.document.index*30 -30);
                }
            })
        })
        ipcRenderer.once('current-directory', (event, arg) => {
            this.setState({
                currentDevice: arg.currentDevice,
                currentDirectory: arg.parent,
                childDirectories: arg.childs
            })
        })
        ipcRenderer.once('no-of-documents', (event, arg) => {
            this.setIndexArray(this.props.document.index, arg);
        })
    }

    changeDir = (dir) => {
        this.setState({
            isLoading: true,
            documents: []
        })
        this.props.setDocumentReset();
        this.props.setDocumentOrder(this.state.order);
        this.props.setDocumentSortType(this.state.sortType);
        ipcRenderer.send('change-document-directory', {
            name: dir,
            isChild: true
        });
        ipcRenderer.once('document-directory-changed', (event, arg) => {
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
                if (arg.isEmpty) {
                    this.setState({
                        isLoading: false
                    })
                } else {
                    ipcRenderer.send('get-documents', this.props.document.index*30 -30);
                }
            })
        })

        ipcRenderer.once('current-directory', (event, arg) => {
            this.setState({
                currentDevice: arg.currentDevice,
                currentDirectory: arg.parent,
                childDirectories: arg.childs
            })
        })
        ipcRenderer.once('no-of-documents', (event, arg) => {
            this.setIndexArray(this.props.document.index, arg);
        })
    }

    setIndexArray = (index, totalDocuments) => {
        var temp = [];
        for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
            if ((i*30 -30) < totalDocuments)
                temp.push(i);
            else
                break;
        }
        this.props.setDocumentIndex(index);
        this.setState({
            index: index,
            indexArray: temp,
            noOfDocuments: totalDocuments,
        });
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
            ipcRenderer.once('no-of-documents', (event, arg) => {
                var index = this.props.document.index;
                this.setIndexArray(index, arg);
            })
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
        ipcRenderer.once('no-of-documents', (event, arg) => {
            var index = this.props.document.index;
            this.setIndexArray(index, arg);
        })
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
        window.scrollTo(0, 0);
    }

    prev = () => {
        this.setState({
            isLoading: true
        })
        const index = this.state.index - 1;
        const noOfDocuments = this.state.noOfDocuments;
        ipcRenderer.send('get-more-documents', index*30 -30)
        ipcRenderer.once('no-of-documents', (event, arg) => {
            var index = this.props.document.index;
            this.setIndexArray(index, arg);
        })
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
        window.scrollTo(0, 0);
    }

    setDocuments = (index) => {
        this.setState({
            isLoading: true
        })
        const noOfDocuments = this.state.noOfDocuments;
        ipcRenderer.send('get-more-documents', (index*30)-30)
        ipcRenderer.once('no-of-documents', (event, arg) => {
            var index = this.props.document.index;
            this.setIndexArray(index, arg);
        })
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
        window.scrollTo(0, 0);
    }

    selectDocument = (i) => {
        //console.log("key-"+i);
        const doc = document.getElementById("key-"+i);
        //console.log(doc.style.opacity);
        if (doc.style.opacity==0.5) {
            let {
                selected
            } = this.state;
            selected.splice(selected.indexOf(this.state.documents[i].path), 1);
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
            selected.push(this.state.documents[i].path);
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

    setDownloadOption = (bool) => {
        this.setState({
            downloadOption: bool
        })
    }

    download = () => {
        ipcRenderer.send('document-download', {
            selected: this.state.selected,
            option: this.state.downloadOption
        });
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

    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
            currentDevice,
            currentDirectory,
            childDirectories,
            downloadOption
        } = this.state;

        const {
            alert,
            alertFile,
            progressBar
        } = this.props.document;

        if (isLoading) {
            return (
                <div style={{height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Spinner animation="border" />
                    <h3 style={{marginBottom: '0', marginLeft: '10px'}}>Loading Files, please wait</h3>
                </div>
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
                                        className="unselect" 
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
                                <Dropdown as={ButtonGroup}>
                                    <Button className="download" variant="light" onClick={this.download}>Download</Button>
                                    <Dropdown.Toggle split variant="light" id="sort-split" />
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            active={!downloadOption}
                                            onClick={() => this.setDownloadOption(false)}
                                        >
                                            Normal Download
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={downloadOption}
                                            onClick={() => this.setDownloadOption(true)}
                                        >
                                            Maintain Directory Structure
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Row>
                    </TopBarStyle>
                    {
                        (!downloading)? (
                            <ContentStyle>
                                <Row>
                                    <Col>
                                        <Dropdown as={ButtonGroup}>
                                            <Button
                                                onClick={this.previousDir}
                                                disabled={(currentDirectory==currentDevice)}
                                                variant='outline-light'
                                            >
                                                Back
                                            </Button>
                                            <p style={{margin: 'auto'}}>
                                                {(currentDevice==currentDirectory)?('/root'):(currentDirectory)}
                                            </p>
                                            <Dropdown.Toggle split variant="outline-light" id="sort-split" />
                                            <Dropdown.Menu className="directory-dropdown">
                                                {
                                                    childDirectories.map((dir, i) => {
                                                        return (
                                                            <Dropdown.Item
                                                                key={i} 
                                                                onClick={() => this.changeDir(dir)}
                                                            >
                                                                {dir}
                                                            </Dropdown.Item>
                                                        );
                                                    })
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Size</th>
                                                    <th>Last Modified (dd/mm/yyyy)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                documents.map((document, i) => {
                                                    //console.log(document);
                                                    var name = document.name.replace(/_/g,"-");
                                                    var size = this.formatBytes(document.size);
                                                    var date = new Date(document.lastModified);
                                                    var key = 'key-' + i;
                                                    //console.log(date);
                                                    return (
                                                        <tr
                                                            style={{opacity: (selected.includes(document.path)?('0.5'):(1))}} 
                                                            key={key} 
                                                            id={key} 
                                                            onClick={() => this.selectDocument(i)}
                                                        >
                                                            <td>{i+1}</td>
                                                            <td style={{maxWidth: '250px', overflow: 'hidden'}}><p>{name}</p></td>
                                                            <td>{size}</td>
                                                            <td>{date.getDate()}/{date.getMonth()}/{date.getFullYear()}</td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                            </tbody>
                                        </Table>
                                    </Col> 
                                </Row>
                                <Row>
                                    <InputGroup>
                                        <InputGroup.Prepend style={{marginLeft: 'auto'}}>
                                            <Button 
                                                variant="outline-light" 
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
                                                            variant="outline-light" 
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
                                                variant="outline-light" 
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
                                                        variant="outline-light"
                                                        onClick={this.closeDownload}
                                                    >
                                                        Close
                                                    </Button>  
                                                </>
                                            ):(
                                                <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <Spinner animation="border" />
                                                    <h3 style={{marginBottom: '0', marginLeft: '10px'}}>Downloading, please wait</h3>
                                                </div>
                                            )
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
    setDocumentAlertActionForAll,
    setDocumentReset 
})(Documents);