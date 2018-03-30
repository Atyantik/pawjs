/**
 * Created by Yash Thakur
 * Date: 31/10/17
 * Time: 11:24 AM
 */

import React, { Component } from "react";
import Prism from "../../../prism/prism";
import ProgressiveImage from "./images/progressive-rendering.png";

export default class ImageOptimization extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Image Optimization</h1>
          <hr/>
        </header>
        <section>
          <section>
            <header>
              <h3 className="mt-4">What is Image Optimization?</h3>
            </header>
            <p>
              The majority of a website’s content is composed of images. Image optimization
              is the process to refine images such that they reduce the total page size and load time,
              also they reduce the network load and data usage (more helpful when user is on mobile data plan).
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4>">Progressive Rendering</h3>
            </header>
            <p>
              <img src={ProgressiveImage} alt="Progressive Rendering of an Image" className="mw-100"/>
            </p>
            <p>
              In this method the browser initially loads a highly pixelated version of the image and then
              progressively replaces it with higher quality versions unless it is completely rendered. This
              results in reduced page load time.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">What is webP?</h3>
            </header>
            <p>
              WebP is a modern <strong>image format</strong> that provides superior <strong>lossless and
              lossy</strong> compression for images on the web. Using WebP, webmasters and web
              developers can create smaller, richer images that make the web faster.
            </p>
            <p>
              WebP lossless images are&nbsp;
              <a
                href="https://developers.google.com/speed/webp/docs/webp_lossless_alpha_study#results"
                target="_blank"
                rel="nofollow noopener"
              >
                26% smaller
              </a> in size compared to PNGs. WebP lossy images are&nbsp;
              <a
                href="https://developers.google.com/speed/webp/docs/webp_study"
                target="_blank"
                rel="nofollow noopener"
              >
                25-34% smaller
              </a> than comparable JPEG images at equivalent&nbsp;
              <a
                href="https://en.wikipedia.org/wiki/Structural_similarity"
                target="_blank"
                rel="nofollow noopener"
              >
                SSIM
              </a> quality index.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">What is <strong>srcset</strong> attribute?</h3>
            </header>
            <p>
              When you want to display separate images (or usually, a separate asset of the same image)
              based on the device-pixel ratio, you’d go with basic srcset implementation:
            </p>
            <Prism
              code={"<img src=\"images/sample.jpg\"\n" +
              "srcset=\"images/sample.jpg 1x, images/sample-2x.jpg 2x,\n" +
              "images/sample-hd.jpg 3x\">"}
              language={"html"}
            />
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">How is <strong>srcset</strong> beneficial?</h3>
            </header>
            <p>
              When you use the srcset and sizes attributes on an 'img' element, you are giving
              the browser necessary information to make a decision what image to request and serve
              to user. It is used to serve same image with different resolutions for different devices.
            </p>
          </section>
        </section>
      </article>
    );
  }
}