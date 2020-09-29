import React from 'react';
import Grid from '@material-ui/core/Grid';
import LemmaGroup from './LemmaGroup';

const LemmaGroups = ({ terms }) => (
  <Grid container spacing={1}>
    <Grid item xs={12}>
      <ul>
        {terms.map((term, index) => <LemmaGroup
          key={index}
          term={term} />)}
      </ul>
    </Grid>
  </Grid>
);

export default LemmaGroups;
