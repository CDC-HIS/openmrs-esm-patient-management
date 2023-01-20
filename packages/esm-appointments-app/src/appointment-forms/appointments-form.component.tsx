import React, { SyntheticEvent, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import isEmpty from 'lodash-es/isEmpty';
import { Button, ButtonSet, SkeletonText } from '@carbon/react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { AppointmentPayload, MappedAppointment } from '../types';
import { amPm, convertTime12to24 } from '../helpers';
import {
  saveAppointment,
  useServices,
  useAppointmentSummary,
  checkAppointmentConflict,
  useMonthlyAppointmentSummary,
} from './appointment-forms.resource';
import { ConfigObject } from '../config-schema';
import { useProviders } from '../hooks/useProviders';
import { closeOverlay } from '../hooks/useOverlay';
import { mockFrequency } from '../../__mocks__/appointments.mock';
import WorkloadCard from './workload.component';
import first from 'lodash-es/first';
import styles from './appointments-form.scss';
import { useSWRConfig } from 'swr';
import { useAppointmentDate } from '../helpers/time';
import { getMonthlyCalendarDistribution, getWeeklyCalendarDistribution } from './workload-helper';
import AppointmentWidget from '../appointment-widget/appointment-widget.component';

interface AppointmentFormProps {
  closeOverlay?: () => void;
  appointment?: MappedAppointment;
  patientUuid?: string;
  context: string;
}
const AppointmentForm: React.FC<AppointmentFormProps> = ({ closeOverlay, appointment, patientUuid, context }) => {
  const initialState = {
    patientUuid,
    dateTime: undefined,
    location: '',
    serviceUuid: '',
    comments: '',
    appointmentKind: '',
    status: '',
    id: undefined,
    gender: '',
    serviceType: '',
    provider: '',
    appointmentNumber: undefined,
  };
  const appointmentState = !isEmpty(appointment) ? appointment : initialState;
  const { t } = useTranslation();
  const [hasSubmissibleValue, setHasSubmissibleValue] = React.useState(false);
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);
  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      submissionNotifier.next({ isSubmitting: true });
    },
    [submissionNotifier],
  );
  const { patient, isLoading } = usePatient(patientUuid ?? appointmentState.patientUuid);
  const [selectedService, setSelectedService] = useState(appointmentState.serviceUuid);
  const [selectedProvider, setSelectedProvider] = useState(appointmentState.provider);
  const [appointmentType, setAppointmentType] = useState(appointmentState.appointmentKind);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMissingRequirements = !selectedService || !appointmentType.length || !selectedProvider;

  return (
    <div className={styles.formContainer}>
      {isLoading ? (
        <SkeletonText />
      ) : (
        <div className={styles.stickyFormHeader}>
          <ExtensionSlot
            extensionSlotName="patient-header-slot"
            state={{
              patient,
              patientUuid: appointmentState.patientUuid,
            }}
          />
        </div>
      )}

      <AppointmentWidget
        appointment={appointment}
        patientUuid={patientUuid}
        closeOverlay={closeOverlay}
        setHasSubmissibleValue={setHasSubmissibleValue}
        submissionNotifier={submissionNotifier}
        context={context}
      />

      <ButtonSet>
        <Button onClick={closeOverlay} className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} kind="primary" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default AppointmentForm;
