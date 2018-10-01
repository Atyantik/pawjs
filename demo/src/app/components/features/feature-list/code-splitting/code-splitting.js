import React, { Component } from "react";

export default class CodeSplitting extends Component {
  render() {
    return (
      <article>
        <header>
          <h1 className="mt-4">Code Splitting</h1>
          <hr/>
        </header>
        <section>
          <p>
            Web applications have the tendency to grow big as features are developed.
            The longer it takes for your application to load, the more frustrating it's to the user.
            This problem is amplified in a mobile environment where the connections can be slow.
          </p>
          <p>
            Even though splitting bundles can help a notch, they are not the only solution,
            and you can still end up having to download a lot of data.
            Fortunately, it's possible to do better thanks to <strong>code splitting</strong>.
            It allows to load code lazily as you need it.
          </p>
        </section>
      </article>
    );
  }
}
