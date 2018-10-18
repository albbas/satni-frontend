import React from 'react';
import { css } from 'react-emotion';

import { ArticleDiv } from '../components';
import Stems from './Stems';

const TermWikiArticle = ({stems, termwikiref}) => {
  return (
    <ArticleDiv>
      <Stems stems={stems} />
      <div className={css({
        textAlign: 'right',
        marginTop: '1%',
        paddingBottom: '0',
        fontSize: '90%'
      })}>
        <a
          href={`https://satni.uit.no/termwiki/index.php?title=${termwikiref}`}
          target='_blank'>
          This article on the TermWiki
        </a>
      </div>
    </ArticleDiv>
  );
};

export default TermWikiArticle;