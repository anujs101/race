import React from 'react';
import katex from 'katex';

const LatexRenderer = ({ latexString }) => {
  const html = katex.renderToString(latexString, {
    throwOnError: false,
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default LatexRenderer;
