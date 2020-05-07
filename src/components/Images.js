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
    Image 
} from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    setImageIndex,
    setImageSortType,
    setImageOrder,
    setImageSelectAll,
    setImageProgressBar,
    setImageDownloading,
    setImageAlert,
    setImageAlertFile,
    setImageSelected,
    setImageAlertAction,
    setImageAlertActionForAll
} from '../redux/actions/image'


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

class Images extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectAll: false,
            images: [],
            isLoading: false,
            index: 1,
            noOfImages: 0,
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
        ipcRenderer.send('get-images', this.props.image.index*12 -12);
        ipcRenderer.on('device-not-connected', (event) => {
            this.setState({
                deviceConnected: false
            })
        })
        ipcRenderer.on('no-of-images', (event, arg) => {
            var temp = [];
            var index = this.props.image.index;
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*12 -12) < arg)
                    temp.push(i);
                else
                    break;
            }
            this.setState({
                noOfImages: arg,
                indexArray: temp
            });
        })
        ipcRenderer.on('images', (event, arg) => {
            this.setState({
                images: arg,
                index: this.props.image.index,
                order: this.props.image.order,
                sortType: this.props.image.sortType,
                selectAll: this.props.image.selectAll,
                downloading: this.props.image.downloading,
                selected: this.props.image.selected,
                alertAction: this.props.image.alertAction,
                alertActionForAll: this.props.image.alertActionForAll,
                isLoading: false
            });
        });
        
        ipcRenderer.on('reset', (event) => {
            this.props.setImageIndex(1);
            this.props.setImageSortType(0);
            this.props.setImageOrder(true);
            this.props.setImageSelectAll(false);
            this.props.setImageProgressBar(0);
            this.props.setImageDownloading(false);
            this.props.setImageAlert(false);
            this.props.setImageAlertFile('');
            this.props.setImageSelected([]);
            this.props.setImageAlertAction(null);
            this.props.setImageAlertActionForAll(false);

            this.setState({
                images: [],
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
        ipcRenderer.send('get-images', this.props.image.index*12 -12);
        this.setState({
            deviceConnected: true
        })
    }

    setOrder = (arg) => {
        this.props.setImageOrder(arg);
        this.setState({
            order: arg
        })
    }

    setSortType = (arg) => {
        this.props.setImageSortType(arg);
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
            ipcRenderer.send('image-sort-by-name', order);
        } else if (sortType===1) {
            ipcRenderer.send('image-sort-by-size', order);
        } else {
            ipcRenderer.send('image-sort-by-last-modified', order);
        }

        ipcRenderer.once('image-sorted', (event) => {
            const index = 1;
            const noOfImages = this.state.noOfImages;
            ipcRenderer.send('get-more-images', index*12 -12);
            ipcRenderer.once('more-images', (event, arg) => {
                var temp = [];
                for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                    if ((i*12 -12) < noOfImages)
                        temp.push(i);
                    else
                        break;
                }
                this.props.setImageIndex(index);
                this.setState({
                    images: arg,
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
        const noOfImages = this.state.noOfImages;
        ipcRenderer.send('get-more-images', index*12 -12);
        ipcRenderer.once('more-images', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*12 -12) < noOfImages)
                    temp.push(i);
                else
                    break;
            }
            this.props.setImageIndex(index);
            this.setState({
                images: arg,
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
        const noOfImages = this.state.noOfImages;
        ipcRenderer.send('get-more-images', index*12 -12)
        ipcRenderer.once('more-images', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*12 -12) < noOfImages)
                    temp.push(i);
                else
                    break;
            }
            this.props.setImageIndex(index);
            this.setState({
                images: arg,
                index: index,
                indexArray: temp,
                isLoading: false
            });
        });
    }

    setImages = (index) => {
        this.setState({
            isLoading: true
        })
        ipcRenderer.send('get-more-images', (index*12)-12)
        ipcRenderer.once('more-images', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                temp.push(i);
            }
            this.props.setImageIndex(index);
            this.setState({
                images: arg,
                indexArray: temp,
                index: index,
                isLoading: false
            });
        });
    }

    selectImage = (i) => {
        //console.log("key-"+i);
        const img = document.getElementById("key-"+i);
        if (img.style.opacity==0.5) {
            let {
                selected
            } = this.state;
            selected.splice(selected.indexOf(this.state.images[i].key), 1);
            img.style.opacity=1;
            this.props.setImageSelected(selected);
            this.props.setImageSelectAll(false);
            this.setState({
                selected,
                selectAll: false
            })
        } else {
            let {
                selected
            } = this.state;
            selected.push(this.state.images[i].key);
            img.style.opacity=0.5;
            this.props.setImageSelected(selected);
            this.setState({
                selected
            })
        }
    }

    selectAllChange = () => {
        let selected = [];
        if (this.state.selectAll) {
            this.props.setImageSelected(selected);
            this.props.setImageSelectAll(false)
            this.setState({
                selectAll: false,
                selected
            })
        } else {
            ipcRenderer.send('get-array-of-images');
            ipcRenderer.once('array-of-images', (event, arg) => {
                this.props.setImageSelected(arg);
                this.props.setImageSelectAll(true)
                this.setState({
                    selected: arg,
                    selectAll: true
                })
            })
        }
    }

    unselectAll = () => {
        this.props.setImageSelected([]);
        this.props.setImageSelectAll(false)
        this.setState({
            selected: [],
            selectAll: false
        })
    }

    download = () => {
        ipcRenderer.send('image-download', this.state.selected);
        this.props.setImageDownloading(true);
        this.setState({
            downloading: true
        })
    }

    closeDownload = () => {
        this.props.setImageProgressBar(0);
        this.props.setImageDownloading(false);
        this.props.setImageSelectAll(false);
        this.props.setImageSelected([]);
        this.props.setImageAlertAction(null);
        this.props.setImageAlertActionForAll(false);
        this.setState({
            downloading: false,
            selectAll: false,
            selected: [],
            alertAction: null,
            alertActionForAll: false
        });
    }

    setAlertActionForAll = () => {
        this.props.setImageAlertActionForAll(!this.state.alertActionForAll);
        this.setState({
            alertActionForAll: !this.state.alertActionForAll
        });
    }

    autoAction = () => {
        this.props.setImageAlert(false);
        this.props.setImageAlertFile('');
        ipcRenderer.send('image-overwrite', this.state.alertAction);
    }

    selectAlert = (bool) => {
        if (this.state.alertActionForAll) {
            this.props.setImageAlert(false);
            this.props.setImageAlertFile('');
            this.props.setImageAlertAction(bool);
            this.setState({
                alertAction: bool
            });
            ipcRenderer.send('image-overwrite', bool);
        } else {
            this.props.setImageAlert(false);
            this.props.setImageAlertFile('');
            ipcRenderer.send('image-overwrite', bool);
        }
        
    }

    render() {

        const {
            selectAll,
            images,
            isLoading,
            noOfImages,
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
        } = this.props.image;

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

        if (isLoading||images.length===0) {
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
                                    {
                                        images.map((image, i) => {
                                            //console.log(images);
                                            var data = image.value;
                                            var type = image.key.slice((image.key.lastIndexOf(".") - 1 >>> 0) + 2);
                                            var key = 'key-' + i;
                                            //console.log(key);
                                            return (
                                                <Image
                                                    key={key} 
                                                    id={key}
                                                    onClick={() => this.selectImage(i)}
                                                    style={{opacity: (selected.includes(image.key)?('0.5'):(1)), width: '200px', height: '200px', margin: '10px'}}
                                                    src={`data:image/${type};base64,${data}`}
                                                    thumbnail
                                                />
                                            );
                                        })
                                    }
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
                                                            onClick={() => this.setImages(arg)}
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
                                                disabled={((index*12)>=noOfImages)?(true):(false)}
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
        image: state.image
    }
}

export default connect(mapStateToProps, { 
    setImageIndex, 
    setImageSortType, 
    setImageOrder,
    setImageSelectAll,
    setImageProgressBar,
    setImageDownloading,
    setImageAlert,
    setImageAlertFile,
    setImageSelected,
    setImageAlertAction,
    setImageAlertActionForAll 
})(Images);