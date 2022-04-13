import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';
import dayjs, { Dayjs } from 'dayjs';

export interface WealthHistoryType {
  _id: string;
  date: Dayjs;
  detail: { [key: string]: number };
}

const convertDtoToWealthHistoryType: (input: any) => WealthHistoryType = (input) => ({
  ...input,
  date: dayjs(input.date),
});

export const insertWealthHistoryRecord: (
  date: Dayjs,
  detail: { [key: string]: number },
) => Promise<WealthHistoryType> = async (date, detail) => {
  const result = (
    await axios.post(
      `${API_PREFIX}/wealthHistory/create`,
      {
        date: date.format(),
        detail,
      },
      {
        headers: getAuthorizationHeaders(),
      },
    )
  ).data;
  if (result.data) {
    return result.data;
  }
  throw new Error('Not Found');
};

export const getLatestHistoryRecord: () => Promise<WealthHistoryType | null> = async () => {
  const result = (
    await axios.get(`${API_PREFIX}/wealthHistory/latestRecord`, {
      headers: getAuthorizationHeaders(),
    })
  ).data;
  if (result.data) {
    return convertDtoToWealthHistoryType(result.data);
  }
  throw new Error('Not Found');
};

export const getAllHistoryRecord: () => Promise<Array<WealthHistoryType>> = async () => {
  const result = (
    await axios.get(`${API_PREFIX}/wealthHistory/allRecord`, {
      headers: getAuthorizationHeaders(),
    })
  ).data;
  if (result.data) {
    return result.data.map(convertDtoToWealthHistoryType);
  }
  throw new Error('Not Found');
};
