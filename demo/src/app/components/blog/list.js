import _ from 'lodash';
import React, { Component } from 'react';
import { getFeaturedMediaUrl, hasFeaturedMedia } from '../../utils/wp';

export default class List extends Component {
  render() {
    const posts = this.props.preLoadedData.posts;
    // const response = this.props.preLoadedData.response;
    return (
      <div className="container mt-5">
        <nav aria-label="Page navigation">
          <ul className="pagination">
            <li className="page-item"><a className="page-link" href="#">Previous</a></li>
            <li className="page-item"><a className="page-link" href="#">1</a></li>
            <li className="page-item"><a className="page-link" href="#">2</a></li>
            <li className="page-item"><a className="page-link" href="#">3</a></li>
            <li className="page-item"><a className="page-link" href="#">Next</a></li>
          </ul>
        </nav>
        <ul className="list-unstyled">
          {
            _.map(posts, (post, index) => (
              <li className={`media p-2 ${index !== 0 && index % 2 !== 0 ? 'my-4' : ''}`} key={post.id}>
                {
                    hasFeaturedMedia(post, 'thumbnail') && (
                      <img
                        className="align-self-center mr-3"
                        src={getFeaturedMediaUrl(post, 'thumbnail')}
                        alt="Generic placeholder image"
                      />
                    )
                  }

                <div className="media-body">
                  <h5 className="mt-0" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <p dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}
