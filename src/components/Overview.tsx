import React from 'react';

export const Overview: React.FC<{
  backgroundColor?: string;
  data: [string, string][];
}> = function ({ backgroundColor = '#1677ff', data }) {
  if (!data[0] || !data[0][0]) {
    return null;
  }
  return (
    <div
      style={{
        backgroundColor,
        borderRadius: 4,
        padding: '6px 6px',
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div>{data[0][0]}</div>
          <div>{data[0][1]}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>{data[1][0]}</div>
          <div>{data[1][1]}</div>
        </div>
      </div>
      {data.length > 2 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
          }}
        >
          <div>
            <div>{data[2][0]}</div>
            <div>{data[2][1]}</div>
          </div>
          {data.length > 4 && (
            <div style={{ textAlign: 'center' }}>
              <div>{data[3][0]}</div>
              <div>{data[3][1]}</div>
            </div>
          )}
          {data.length > 3 &&
            (data.length > 4 ? (
              <div style={{ textAlign: 'right' }}>
                <div>{data[4][0]}</div>
                <div>{data[4][1]}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'right' }}>
                <div>{data[3][0]}</div>
                <div>{data[3][1]}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
