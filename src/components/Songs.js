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
    setSongIndex,
    setSongSortType,
    setSongOrder,
    setSongSelectAll,
    setSongProgressBar,
    setSongDownloading,
    setSongAlert,
    setSongAlertFile,
    setSongSelected,
    setSongAlertAction,
    setSongAlertActionForAll,
    setSongReset
} from '../redux/actions/song'


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

class Songs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectAll: false,
            songs: [],
            isLoading: false,
            index: 1,
            noOfSongs: 0,
            downloading: false,
            indexArray: [],
            order: true,
            sortType: 0,
            selected: [],
            alertAction: null,
            alertActionForAll: false,
            currentDevice: '',
            currentDirectory: '',
            childDirectories: []
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
            index: this.props.song.index,
            order: this.props.song.order,
            sortType: this.props.song.sortType,
            selectAll: this.props.song.selectAll,
            downloading: this.props.song.downloading,
            selected: this.props.song.selected,
            alertAction: this.props.song.alertAction,
            alertActionForAll: this.props.song.alertActionForAll,
        })
        ipcRenderer.send('get-songs', this.props.song.index*30 -30);
        ipcRenderer.once('current-directory', (event, arg) => {
            this.setState({
                currentDevice: arg.currentDevice,
                currentDirectory: arg.parent,
                childDirectories: arg.childs
            })
        })
        ipcRenderer.once('no-of-songs', (event, arg) => {
            var index = this.props.song.index;
            this.setIndexArray(index, arg);
            if (arg==0) {
                this.setState({
                    isLoading: false
                })
            }
        })
        ipcRenderer.removeAllListeners('songs');
        ipcRenderer.on('songs', (event, arg) => {
            //console.log(arg);
            this.setState({
                songs: arg,
                isLoading: false
            });
        });
    }

    previousDir = () => {
        this.setState({
            isLoading: true,
        })
        this.props.setSongReset();
        this.props.setSongOrder(this.state.order);
        this.props.setSongSortType(this.state.sortType);
        ipcRenderer.send('change-song-directory', {
            isChild: false
        });
        ipcRenderer.once('song-directory-changed', (event, arg) => {
            const {
                sortType,
                order
            } = this.state;
    
            if (sortType===0) {
                ipcRenderer.send('song-sort-by-name', order);
            } else if (sortType===1) {
                ipcRenderer.send('song-sort-by-size', order);
            } else {
                ipcRenderer.send('song-sort-by-last-modified', order);
            }

            ipcRenderer.once('song-sorted', (event) => {
                if (arg.isEmpty) {
                    this.setState({
                        isLoading: false
                    })
                } else {
                    ipcRenderer.send('get-songs', this.props.song.index*30 -30);
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
        ipcRenderer.once('no-of-songs', (event, arg) => {
            this.setIndexArray(this.props.song.index, arg);
        })
    }

    changeDir = (dir) => {
        this.setState({
            isLoading: true,
            songs: []
        })
        this.props.setSongReset();
        this.props.setSongOrder(this.state.order);
        this.props.setSongSortType(this.state.sortType);
        ipcRenderer.send('change-song-directory', {
            name: dir,
            isChild: true
        });
        ipcRenderer.once('song-directory-changed', (event, arg) => {
            const {
                sortType,
                order
            } = this.state;
    
            if (sortType===0) {
                ipcRenderer.send('song-sort-by-name', order);
            } else if (sortType===1) {
                ipcRenderer.send('song-sort-by-size', order);
            } else {
                ipcRenderer.send('song-sort-by-last-modified', order);
            }

            ipcRenderer.once('song-sorted', (event) => {
                if (arg.isEmpty) {
                    this.setState({
                        isLoading: false
                    })
                } else {
                    ipcRenderer.send('get-songs', this.props.song.index*30 -30);
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
        ipcRenderer.once('no-of-songs', (event, arg) => {
            this.setIndexArray(this.props.song.index, arg);
        })
    }

    setIndexArray = (index, totalSongs) => {
        var temp = [];
        for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
            if ((i*30 -30) < totalSongs)
                temp.push(i);
            else
                break;
        }
        this.props.setSongIndex(index);
        this.setState({
            index: index,
            indexArray: temp,
            noOfSongs: totalSongs,
        });
    }

    setOrder = (arg) => {
        this.props.setSongOrder(arg);
        this.setState({
            order: arg
        })
    }

    setSortType = (arg) => {
        this.props.setSongSortType(arg);
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
            ipcRenderer.send('song-sort-by-name', order);
        } else if (sortType===1) {
            ipcRenderer.send('song-sort-by-size', order);
        } else {
            ipcRenderer.send('song-sort-by-last-modified', order);
        }

        ipcRenderer.once('song-sorted', (event) => {
            const index = 1;
            const noOfSongs = this.state.noOfSongs;
            ipcRenderer.send('get-more-songs', index*30 -30);
            ipcRenderer.once('no-of-songs', (event, arg) => {
                var index = this.props.song.index;
                this.setIndexArray(index, arg);
            })
            ipcRenderer.once('more-songs', (event, arg) => {
                var temp = [];
                for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                    if ((i*30 -30) < noOfSongs)
                        temp.push(i);
                    else
                        break;
                }
                this.props.setSongIndex(index);
                this.setState({
                    songs: arg,
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
        const noOfSongs = this.state.noOfSongs;
        ipcRenderer.send('get-more-songs', index*30 -30);
        ipcRenderer.once('no-of-songs', (event, arg) => {
            var index = this.props.song.index;
            this.setIndexArray(index, arg);
        })
        ipcRenderer.once('more-songs', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < noOfSongs)
                    temp.push(i);
                else
                    break;
            }
            this.props.setSongIndex(index);
            this.setState({
                songs: arg,
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
        const noOfSongs = this.state.noOfSongs;
        ipcRenderer.send('get-more-songs', index*30 -30)
        ipcRenderer.once('no-of-songs', (event, arg) => {
            var index = this.props.song.index;
            this.setIndexArray(index, arg);
        })
        ipcRenderer.once('more-songs', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < noOfSongs)
                    temp.push(i);
                else
                    break;
            }
            this.props.setSongIndex(index);
            this.setState({
                songs: arg,
                index: index,
                indexArray: temp,
                isLoading: false
            });
        });
        window.scrollTo(0, 0);
    }

    setSongs = (index) => {
        this.setState({
            isLoading: true
        })
        const noOfSongs = this.state.noOfSongs;
        ipcRenderer.send('get-more-songs', (index*30)-30)
        ipcRenderer.once('no-of-songs', (event, arg) => {
            var index = this.props.song.index;
            this.setIndexArray(index, arg);
        })
        ipcRenderer.once('more-songs', (event, arg) => {
            var temp = [];
            for (var i=(((index-4)<=0)?(1):(index-4));i<=(((index+5)<10)?(10):(index+5));i++) {
                if ((i*30 -30) < noOfSongs)
                    temp.push(i);
                else
                    break;
            }
            this.props.setSongIndex(index);
            this.setState({
                songs: arg,
                indexArray: temp,
                index: index,
                isLoading: false
            });
        });
        window.scrollTo(0, 0);
    }

    selectSong = (i) => {
        //console.log("key-"+i);
        const doc = document.getElementById("key-"+i);
        //console.log(doc.style.opacity);
        if (doc.style.opacity==0.5) {
            let {
                selected
            } = this.state;
            selected.splice(selected.indexOf(this.state.songs[i].path), 1);
            doc.style.opacity=1;
            this.props.setSongSelected(selected);
            this.props.setSongSelectAll(false);
            this.setState({
                selected,
                selectAll: false
            })
        } else {
            let {
                selected
            } = this.state;
            selected.push(this.state.songs[i].path);
            doc.style.opacity=0.5;
            this.props.setSongSelected(selected);
            this.setState({
                selected
            })
        }
    }

    selectAllChange = () => {
        let selected = [];
        if (this.state.selectAll) {
            this.props.setSongSelected(selected);
            this.props.setSongSelectAll(false)
            this.setState({
                selectAll: false,
                selected
            })
        } else {
            ipcRenderer.send('get-array-of-songs');
            ipcRenderer.once('array-of-songs', (event, arg) => {
                this.props.setSongSelected(arg);
                this.props.setSongSelectAll(true)
                this.setState({
                    selected: arg,
                    selectAll: true
                })
            })
        }
    }

    unselectAll = () => {
        this.props.setSongSelected([]);
        this.props.setSongSelectAll(false)
        this.setState({
            selected: [],
            selectAll: false
        })
    }

    download = () => {
        ipcRenderer.send('song-download', this.state.selected);
        this.props.setSongDownloading(true);
        this.setState({
            downloading: true
        })
    }

    closeDownload = () => {
        this.props.setSongProgressBar(0);
        this.props.setSongDownloading(false);
        this.props.setSongSelectAll(false);
        this.props.setSongSelected([]);
        this.props.setSongAlertAction(null);
        this.props.setSongAlertActionForAll(false);
        this.setState({
            downloading: false,
            selectAll: false,
            selected: [],
            alertAction: null,
            alertActionForAll: false
        });
    }

    setAlertActionForAll = () => {
        this.props.setSongAlertActionForAll(!this.state.alertActionForAll);
        this.setState({
            alertActionForAll: !this.state.alertActionForAll
        });
    }

    autoAction = () => {
        this.props.setSongAlert(false);
        this.props.setSongAlertFile('');
        ipcRenderer.send('song-overwrite', this.state.alertAction);
    }

    selectAlert = (bool) => {
        if (this.state.alertActionForAll) {
            this.props.setSongAlert(false);
            this.props.setSongAlertFile('');
            this.props.setSongAlertAction(bool);
            this.setState({
                alertAction: bool
            });
            ipcRenderer.send('song-overwrite', bool);
        } else {
            this.props.setSongAlert(false);
            this.props.setSongAlertFile('');
            ipcRenderer.send('song-overwrite', bool);
        }
        
    }

    render() {

        const {
            selectAll,
            songs,
            isLoading,
            noOfSongs,
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
            childDirectories
        } = this.state;

        const {
            alert,
            alertFile,
            progressBar
        } = this.props.song;

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
                                <Button className="download" variant="light" onClick={this.download}>Download</Button>
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
                                                    <th>Size (B)</th>
                                                    <th>Last Modified (dd/mm/yyyy)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                songs.map((song, i) => {
                                                    //console.log(song);
                                                    var name = song.name.replace(/_/g,"-");
                                                    var size = song.size;
                                                    var date = new Date(song.lastModified);
                                                    var key = 'key-' + i;
                                                    //console.log(date);
                                                    return (
                                                        <tr
                                                            style={{opacity: (selected.includes(song.path)?('0.5'):(1))}} 
                                                            key={key} 
                                                            id={key} 
                                                            onClick={() => this.selectSong(i)}
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
                                                            onClick={() => this.setSongs(arg)}
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
                                                disabled={((index*30)>=noOfSongs)?(true):(false)}
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
        song: state.song
    }
}

export default connect(mapStateToProps, { 
    setSongIndex, 
    setSongSortType, 
    setSongOrder,
    setSongSelectAll,
    setSongProgressBar,
    setSongDownloading,
    setSongAlert,
    setSongAlertFile,
    setSongSelected,
    setSongAlertAction,
    setSongAlertActionForAll,
    setSongReset 
})(Songs);