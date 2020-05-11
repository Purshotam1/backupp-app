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
    Image,
    Spinner 
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
    setImageAlertActionForAll,
    setImageReset
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
    .col {
        flex: 25%;
        padding: 10px;
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

class Images extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectAll: false,
            images: Array(12).fill(null),
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
            currentDevice: '',
            currentDirectory: '',
            childDirectories: [],
            noOfImageLoaded: 0,
            downloadOption: false
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
            index: this.props.image.index,
            order: this.props.image.order,
            sortType: this.props.image.sortType,
            selectAll: this.props.image.selectAll,
            downloading: this.props.image.downloading,
            selected: this.props.image.selected,
            alertAction: this.props.image.alertAction,
            alertActionForAll: this.props.image.alertActionForAll
        })
        ipcRenderer.send('get-images', { 
            index: this.props.image.index*12 -12,
            pageNo: this.props.image.index 
        });
        ipcRenderer.once('current-directory', (event, arg) => {
            this.setState({
                currentDevice: arg.currentDevice,
                currentDirectory: arg.parent,
                childDirectories: arg.childs
            })
        })
        ipcRenderer.once('no-of-images', (event, arg) => {
            this.setIndexArray(this.props.image.index, arg);
            if (arg==0) {
                this.setState({
                    isLoading: false
                })
            }
        })
        ipcRenderer.removeAllListeners('image');
        ipcRenderer.on('image', (event, arg) => {
            let images = this.state.images;
            let index = this.props.image.index;
            //console.log(arg);
            if (arg.pageNo == index) {
                //console.log(arg.key);
                images[arg.id] = arg;
                this.setState({
                    images,
                    noOfImageLoaded: this.state.noOfImageLoaded -1,
                    isLoading: false
                })
            }
        });
        ipcRenderer.removeAllListeners('no-of-image-loaded');
        ipcRenderer.on('no-of-image-loaded', (event, arg) => {
            this.setState({
                noOfImageLoaded: this.state.noOfImageLoaded+arg
            })
        })
    }

    previousDir = () => {
        this.setState({
            isLoading: true,
            images: Array(12).fill(null),
            noOfImageLoaded: 0
        })
        this.props.setImageReset();
        this.props.setImageOrder(this.state.order);
        this.props.setImageSortType(this.state.sortType);
        ipcRenderer.send('change-image-directory', {
            isChild: false
        });
        ipcRenderer.once('image-directory-changed', (event, arg) => {
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
                if (arg.isEmpty) {
                    this.setState({
                        isLoading: false
                    })
                } else {
                    ipcRenderer.send('get-images', { 
                        index: this.props.image.index*12 -12,
                        pageNo: this.props.image.index 
                    });
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
        ipcRenderer.once('no-of-images', (event, arg) => {
            this.setIndexArray(this.props.image.index, arg);
        })
    }

    changeDir = (dir) => {
        this.setState({
            isLoading: true,
            images: Array(12).fill(null),
            noOfImageLoaded: 0
        })
        this.props.setImageReset();
        this.props.setImageOrder(this.state.order);
        this.props.setImageSortType(this.state.sortType);
        ipcRenderer.send('change-image-directory', {
            name: dir,
            isChild: true
        });
        ipcRenderer.once('image-directory-changed', (event, arg) => {
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
                if (arg.isEmpty) {
                    this.setState({
                        isLoading: false
                    })
                } else {
                    ipcRenderer.send('get-images', { 
                        index: this.props.image.index*12 -12,
                        pageNo: this.props.image.index 
                    });
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
        ipcRenderer.once('no-of-images', (event, arg) => {
            this.setIndexArray(this.props.image.index, arg);
        })
    }

    setIndexArray = (index, totalImages) => {
        var temp = [];
        for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
            if ((i*12 -12) < totalImages)
                temp.push(i);
            else
                break;
        }
        this.props.setImageIndex(index);
        this.setState({
            index: index,
            indexArray: temp,
            noOfImages: totalImages,
        });
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
            isLoading: true,
            images: Array(12).fill(null),
            noOfImageLoaded: 0
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
            ipcRenderer.send('get-more-images', { 
                index: index*12 -12,
                pageNo: index 
            });
            ipcRenderer.once('no-of-images', (event, arg) => {
                this.setIndexArray(this.props.image.index, arg);
            })
            this.setIndexArray(index, noOfImages);
        })
    }

    next = () => {
        this.setState({
            isLoading: true,
            images: Array(12).fill(null),
            noOfImageLoaded: 0
        });
        const index = this.state.index + 1;
        const noOfImages = this.state.noOfImages;
        ipcRenderer.send('get-more-images', { 
            index: index*12 -12,
            pageNo: index 
        });
        ipcRenderer.once('no-of-images', (event, arg) => {
            this.setIndexArray(this.props.image.index, arg);
        })
        this.setIndexArray(index, noOfImages);
        window.scrollTo(0, 0);
    }

    prev = () => {
        this.setState({
            isLoading: true,
            images: Array(12).fill(null),
            noOfImageLoaded: 0
        })
        const index = this.state.index - 1;
        const noOfImages = this.state.noOfImages;
        ipcRenderer.send('get-more-images', { 
            index: index*12 -12,
            pageNo: index 
        })
        ipcRenderer.once('no-of-images', (event, arg) => {
            this.setIndexArray(this.props.image.index, arg);
        })
        this.setIndexArray(index, noOfImages);
        window.scrollTo(0, 0);
    }

    setImages = (index) => {
        this.setState({
            isLoading: true,
            images: Array(12).fill(null),
            noOfImageLoaded: 0
        })
        ipcRenderer.send('get-more-images', { 
            index: index*12 -12,
            pageNo: index 
        })
        ipcRenderer.once('no-of-images', (event, arg) => {
            this.setIndexArray(this.props.image.index, arg);
        })
        this.setIndexArray(index, this.state.noOfImages);
        window.scrollTo(0, 0);
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

    setDownloadOption = (bool) => {
        this.setState({
            downloadOption: bool
        })
    }

    download = () => {
        ipcRenderer.send('image-download', {
            selected: this.state.selected,
            option: this.state.downloadOption
        });
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
            currentDevice,
            currentDirectory,
            childDirectories,
            noOfImageLoaded,
            downloadOption
        } = this.state;

        const {
            alert,
            alertFile,
            progressBar
        } = this.props.image;
        //console.log(noOfImageLoaded);
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
                                        <div style={{margin: 'auto'}} className="checkbox">
                                            <InputGroup.Checkbox checked={selectAll} onChange={this.selectAllChange} />
                                        </div>
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
                                            <Dropdown.Toggle 
                                                split
                                                disabled={childDirectories.length==0} 
                                                variant="outline-light" 
                                                id="sort-split" 
                                            />
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
                                    {
                                        images.map((image, i) => {

                                            if (image == null) {
                                                return null;
                                            } else {
                                                var data = image.value;
                                                var type = image.key.slice((image.key.lastIndexOf(".") - 1 >>> 0) + 2);
                                                var key = 'key-' + i;
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
                                            }
                                        })
                                    }
                                    </Col> 
                                </Row>
                                {
                                    (noOfImageLoaded!=0)?(
                                        <Row>
                                            <Col>
                                                <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <Spinner animation="border" />
                                                    <h3 style={{marginBottom: '0', marginLeft: '10px'}}>Loading Files, please wait</h3>
                                                </div>
                                            </Col>
                                        </Row>
                                    ):(null)
                                }
                                <Row>
                                    <Col>
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
                                                    variant="outline-light" 
                                                    onClick={this.next}
                                                    disabled={((index*12)>=noOfImages)?(true):(false)}
                                                >
                                                    Next
                                                </Button>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Col>
                                </Row>    
                            </ContentStyle> 
                        ) : (
                            <DownloadingStyle>
                                <Row>
                                    <Col>
                                        <ProgressBar
                                            style={{width: '100%'}} 
                                            now={Math.round((progressBar/((selected.length==0)?(1):(selected.length)))*100)} 
                                            label={`${Math.round((progressBar/((selected.length==0)?(1):(selected.length)))*100)}`} 
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
    setImageAlertActionForAll,
    setImageReset 
})(Images);