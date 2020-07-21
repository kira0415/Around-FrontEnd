import React, { Component } from 'react'
import { Tabs, Spin, Row, Col, Radio } from 'antd';
import AroundMap from './AroundMap';

import { 
    GEO_OPTIONS, 
    POS_KEY, 
    API_ROOT, 
    AUTH_HEADER, 
    TOKEN_KEY,
    POST_TYPE_IMAGE,
    POST_TYPE_VIDEO,
    POST_TYPE_UNKNOWN,
    TOPIC_AROUND,
    TOPIC_FACE
 } from '../constants';
import Gallery from './Gallery';
import CreatePostButton from './CreatePostButton';
const { TabPane } = Tabs;

class Home extends Component {
    state = {
        posts: [],
        err: '',
        isLoadingGeo: false,
        isLoadingPosts: false,
        topic: TOPIC_AROUND
    }

    componentDidMount() {
        if("geolocation" in navigator) {
            this.setState({
                isLoadingGeo: true,
                err: ''
            })
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            );
        } else {
            this.setState({
                err: 'fetch geolocation failed'
            });
        }
    }

    onSuccessLoadGeoLocation = (position) => {
       console.log(position);
       const { latitude, longitude } = position.coords;
       localStorage.setItem(POS_KEY, JSON.stringify({ lat: latitude, lon: longitude }));
       this.setState({ isLoadingGeo: false, err: '' });

       this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = () => {
        this.setState({ isLoadingGeo: false, error: 'Failed to load geo location.' });
    }

    loadNearbyPosts = (center, radius) => {
        const {lat, lon} = center ? center : JSON.parse(localStorage.getItem(POS_KEY));
        const range = radius ? radius : 20000;
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true, error: '' });
        return fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`, {
            method: "GET",
            headers: {Authorization: `${AUTH_HEADER} ${token}`}
        })
        .then(response => {
            if(response.ok) {
                return response.json()
            }
            throw new Error("fetch posts failed")
        })
        .then(data => {
            console.log(data);
            this.setState({
                posts: data ? data : [],
                isLoadingPosts: false
            })
        })
        .catch(err => {
            console.log("err in fetching posts", err)
            this.setState({
                isLoadingPosts: false,
                err: 'fetch posts failed'
            })
        })
    }

    renderPosts = (type) => {
        const { posts, err, isLoadingGeo, isLoadingPosts } = this.state;

        if(err) {
            return err;
        } else if(isLoadingGeo) {
            return <Spin tip="Loading GEO location"/>
        } else if(isLoadingPosts) {
            return <Spin tip="Loading posts"/>
        } else if(posts.length > 0) {
            return type === POST_TYPE_IMAGE ? this.renderImagePosts() :
                            this.renderVideoPosts();
        } else {
            return 'no posts';
        }
    }

    renderImagePosts = () => {
        const { posts } = this.state;
        const images = posts.filter(post => post.type === POST_TYPE_IMAGE)
                            .map((post) => {
                                return {
                                    src: post.url,
                                    user: post.user,
                                    thumbnailWidth: 400,
                                    thumbnailHeight: 300,
                                    thumbnail:post.url,
                                    caption: post.message
                                };
                            });
        return <Gallery images={images}/>
    }

    renderVideoPosts = () => {
        const { posts } = this.state;
        return (
            <Row>
                {
                    posts.filter((post) => [POST_TYPE_VIDEO, POST_TYPE_UNKNOWN].includes(post.type))
                        .map((post) => (
                            <Col span={6} key={post.url}>
                                <video src={post.url} controls={true} className="video-block"/>
                               <p>{post.user}: {post.message}</p>
                            </Col>
                        ))
                }
            </Row>
        );
    }

    handleTopicChange = (e) => {
        const topic = e.target.value;
        this.setState({ topic });
        if (topic === TOPIC_AROUND) {
            this.loadNearbyPosts();
        } else {
            this.loadFacesAroundTheWolrd();
        }
    }
 
    loadFacesAroundTheWolrd = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({ isLoadingPosts: true, error: '' });
        return fetch(`${API_ROOT}/cluster?term=face`, {
            method: 'GET',
            headers: {
                Authorization: `${AUTH_HEADER} ${token}`,
            }
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to load posts');
            })
            .then((data) => {
                console.log(data);
                this.setState({ posts: data ? data : [], isLoadingPosts: false });
            })
            .catch((e) => {
                console.error(e);
                this.setState({ isLoadingPosts: false , error: e.message });
            });
    }
 
    render() {
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;
        return (
            <div>
                <Radio.Group onChange={this.handleTopicChange} value={this.state.topic}>
                   <Radio value={TOPIC_AROUND}>Posts Around Me</Radio>
                   <Radio value={TOPIC_FACE}>Faces Around The World</Radio>
               </Radio.Group>
               <Tabs tabBarExtraContent={operations}>
                    <TabPane tab="Image Posts" key="1">
                        { this.renderPosts(POST_TYPE_IMAGE) }
                    </TabPane>
                    <TabPane tab="Video Posts" key="2">
                        { this.renderPosts(POST_TYPE_VIDEO) }
                    </TabPane>
                    <TabPane tab="Map" key="3">
                        <AroundMap googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCvxFBT-gsn1bFzxxtc4ifbtyIrZjqIdxo&v=3.exp&libraries=geometry,drawing,places"
                                loadingElement={<div style={{ height: `100%` }} />}
                                containerElement={<div style={{ height: `600px` }} />}
                                mapElement={<div style={{ height: `100%` }} />}
                                loadNearbyPosts={this.loadNearbyPosts}
                                posts={this.state.posts}
                                loadPostsByTopic={this.loadPostsByTopic}
                        />
                    </TabPane>
                </Tabs>
            </div>
            
        )
    }
}

export default Home;
