import React, { SyntheticEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ButtonSet, SkeletonText } from '@carbon/react';
import { AppointmentPayload, MappedAppointment } from '../types';
import { closeOverlay } from '../hooks/useOverlay';
import styles from './appointments-form.scss';
import AppointmentWidget from '../appointment-widget/appointment-widget.component';
import { BehaviorSubject } from 'rxjs';
import { usePatient, ExtensionSlot } from '@openmrs/esm-framework';
import { PatientAppointment, useInitialAppointmentFormValue } from './useInitialFormValues';

interface AppointmentFormProps {
  closeWorkspace?: () => void;
  closeOverlay?: () => void;
  appointment?: MappedAppointment;
  patientUuid?: string;
  context: string;
}
const AppointmentForm: React.FC<AppointmentFormProps> = ({ closeWorkspace, appointment, patientUuid, context }) => {
  const { t } = useTranslation();
  const [hasSubmissibleValue, setHasSubmissibleValue] = React.useState(false);
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);
  const initialAppointmentFormValues = useInitialAppointmentFormValue(appointment, patientUuid);
  const [patientAppointment, setPatientAppointment] = useState<PatientAppointment>(initialAppointmentFormValues);
  const { patient, isLoading } = usePatient(patientUuid ?? patientAppointment.patientUuid);
  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      submissionNotifier.next({ isSubmitting: true });
    },
    [submissionNotifier],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      {isLoading ? (
        <SkeletonText />
      ) : (
        <div className={styles.stickyFormHeader}>
          <ExtensionSlot
            extensionSlotName="patient-header-slot"
            state={{
              patient,
              patientUuid: patientAppointment.patientUuid,
            }}
          />
        </div>
      )}
      <AppointmentWidget
        patientUuid={patientUuid}
        closeWorkspace={closeWorkspace}
        closeOverlay={closeOverlay}
        setHasSubmissibleValue={setHasSubmissibleValue}
        submissionNotifier={submissionNotifier}
        context={context}
        appointment={appointment}
      />
      <ButtonSet>
        <Button onClick={closeOverlay} className={styles.button} kind="secondary">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={hasSubmissibleValue} kind="primary" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AppointmentForm;
