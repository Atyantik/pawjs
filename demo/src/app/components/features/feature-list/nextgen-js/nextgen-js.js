/**
 * Created by Yash Thakur
 * Date: 28/10/17
 * Time: 3:40 PM
 */

import React, { Component } from "react";

export default class NextGenJS extends Component {
  render() {
    return(
      <article>
        <header>
          <h1 className="mt-4">Next Generation JavaScript</h1>
          <hr/>
        </header>
        <section>
          <section>
            <header>
              <h3 className="mt-4">Babel</h3>
            </header>
            <p>
              The JSX syntax and ES6/ES7, are not supported in all the browsers.
            </p>
            <p>
              Hence, if we are using them in the React code, we need to use a tool which
              translates them to the format that has been supported by the browsers.
              It’s where&nbsp;
              <a
                href="http://babeljs.io"
                target="_blank"
                rel="nofollow noopener"
              >
                babel
              </a> comes into the picture.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">What is ECMAScript(ES)?</h3>
            </header>
            <p>
              <span className="font-weight-bold">ECMAScript (or ES)</span> is a trademarked scripting-language specification standardized by Ecma International in ECMA-262 and ISO/IEC 16262.
              It was created to standardize JavaScript, so as to foster multiple independent implementations.
              JavaScript has remained the best-known implementation of ECMAScript since the standard was first published,
              with other well-known implementations including <a href="https://en.wikipedia.org/wiki/JScript" target="_blank" rel="nofollow noopener">
              JScript</a> and <a href="https://en.wikipedia.org/wiki/ActionScript" target="_blank" rel="nofollow noopener">ActionScript</a>.
              Coders commonly use ECMAScript for client-side scripting on the World Wide Web,
              and it is increasingly being used for writing server applications and services using Node.js.
            </p>

          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">ECMAScript 6 (ES6)/ ECMAScript 2015 (ES2015)</h3>
            </header>
            <p>
              The 6th edition, officially known as ECMAScript 2015, was finalized in June 2015.
              This update adds significant new syntax for writing complex applications,
              including classes and modules, but defines them semantically in the same terms as ECMAScript 5 strict mode.
              Other new features include iterators and for/of loops,
              Python-style generators and generator expressions, arrow functions, binary data,
              typed arrays, collections (maps, sets and weak maps), promises, number and math enhancements, reflection,
              and proxies (metaprogramming for virtual objects and wrappers).
              The complete list is extensive. Browser support for ES2015 is still incomplete.
              However, ES2015 code can be transpiled into ES5 code, which has more consistent support across browsers.
              Transpiling adds an extra step to build processes whereas polyfills allow adding extra functionalities by including another JavaScript file.
            </p>
          </section>
          <hr/>

          <section>
            <header>
              <h3 className="mt-4">ECMAScript 7 (ES7)/ ECMAScript 2016 (ES2016)</h3>
            </header>
            <p>
              The 7th edition, officially known as ECMAScript 2016, was finalized in June 2016.
              New features include the exponentiation operator (**) and others.
            </p>
          </section>

        </section>
      </article>
    );
  }
}