import { openmrsFetch } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';
import { Appointment, DurationPeriod } from '../types';

interface AppointmentsReturnType {
  isLoading: boolean;
  appointments: Array<Appointment>;
  error: Error;
}

export const useDailyAppointments = (startDateTime: string, durationPeriod: DurationPeriod) => {
  const url = `/ws/rest/v1/appointment/all?forDate=${startDateTime}`;
  const { data, error, isLoading } = useSWR<{ data: Array<Appointment> }>(startDateTime ? url : null, openmrsFetch);

  return {
    appointments: data?.data ?? [],
    isLoading,
    error: error,
  };
};

export const useAppointmentsByDurationPeriod = (date: string, durationPeriod: DurationPeriod) => {
  const abortController = new AbortController();
  const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;
  const { startDate, endDate } = getStartAndEndDate(durationPeriod, date);

  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        startDate: startDate,
        endDate: endDate,
      },
    });

  const url = 'openmrs/ws/rest/v1/appointments/search';
  const { data, error, isLoading } = useSWR<{ data: Array<Appointment> }>(url, fetcher);
  return { isLoading, appointments: data?.data ?? [], error };
};

const getStartAndEndDate = (durationPeriod: DurationPeriod, date: string) => {
  if (durationPeriod === DurationPeriod.weekly) {
    const startDate = dayjs(new Date(date)).startOf('week').format(omrsDateFormat);
    const endDate = dayjs(new Date(date)).endOf('week').format(omrsDateFormat);
    return { startDate, endDate };
  }

  const startDate = dayjs(new Date(date)).startOf('week').format(omrsDateFormat);
  const endDate = dayjs(new Date(date)).endOf('week').format(omrsDateFormat);
  return { startDate, endDate };
};
