import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import VisitForm from './visit-form/visit-form.component';
import { SearchTypes } from '../types';
import QueueServiceForm from '../queue-services/queue-service-form.component';
import QueueRoomForm from '../queue-rooms/queue-room-form.component';

interface PatientSearchProps {
  closePanel: () => void;
  view?: string;
  viewState: {
    selectedPatientUuid?: string;
  };
}

const PatientSearch: React.FC<PatientSearchProps> = ({ closePanel, view, viewState }) => {
  const { t } = useTranslation();
  const { selectedPatientUuid } = viewState;
  const [searchType, setSearchType] = useState<SearchTypes>(
    view === 'queue_service_form'
      ? SearchTypes.QUEUE_SERVICE_FORM
      : view === 'queue_room_form'
      ? SearchTypes.QUEUE_ROOM_FORM
      : SearchTypes.SCHEDULED_VISITS,
  );
  const [newVisitMode, setNewVisitMode] = useState<boolean>(false);

  const toggleSearchType = (searchType: SearchTypes, mode: boolean = false) => {
    setSearchType(searchType);
    setNewVisitMode(mode);
  };

  return (
    <>
      <Overlay header={t('addPatientToQueue', 'Add patient to queue')} closePanel={closePanel}>
        <div className="omrs-main-content">
          {searchType === SearchTypes.SCHEDULED_VISITS ? (
            <PatientScheduledVisits
              patientUuid={selectedPatientUuid}
              toggleSearchType={toggleSearchType}
              closePanel={closePanel}
            />
          ) : searchType === SearchTypes.VISIT_FORM ? (
            <VisitForm
              patientUuid={selectedPatientUuid}
              toggleSearchType={toggleSearchType}
              closePanel={closePanel}
              mode={newVisitMode}
            />
          ) : searchType === SearchTypes.QUEUE_SERVICE_FORM ? (
            <QueueServiceForm toggleSearchType={toggleSearchType} closePanel={closePanel} />
          ) : searchType === SearchTypes.QUEUE_ROOM_FORM ? (
            <QueueRoomForm toggleSearchType={toggleSearchType} closePanel={closePanel} />
          ) : null}
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearch;
