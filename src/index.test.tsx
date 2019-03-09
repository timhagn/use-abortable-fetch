import React from 'react';
import { render, cleanup, waitForElement } from 'react-testing-library';
import fetch from 'jest-fetch-mock';

// Note: Both tests still produce the following error message
//   Warning: An update to LoadData inside a test was not wrapped in act(...).

import useAbortableFetch from './index';

(global as any).fetch = fetch;
afterEach(cleanup);

const LoadData = () => {
  const { data, loading, error, abort } = useAbortableFetch(
    'http://some-server'
  );

  return (
    <div>
      <div>Loading: {JSON.stringify(loading)}</div>
      <div>Error: {JSON.stringify(error)}</div>
      <div>Data: {JSON.stringify(data)}</div>
    </div>
  );
};

test('Renders the data after success', async () => {
  (fetch as any).mockResponseOnce(JSON.stringify({ x: 1 }));

  const { getByText } = render(<LoadData />);

  getByText('Loading: true');
  await waitForElement(() => getByText('Loading: false'));

  getByText('Data: {"x":1}');
  getByText('Error: null');
});

test('Renders the error after failure', async () => {
  (fetch as any).mockRejectOnce({ status: 404 });

  const { getByText } = render(<LoadData />);

  getByText('Loading: true');
  await waitForElement(() => getByText('Loading: false'));

  getByText('Data: null');
  getByText('Error: {"status":404}');
});
