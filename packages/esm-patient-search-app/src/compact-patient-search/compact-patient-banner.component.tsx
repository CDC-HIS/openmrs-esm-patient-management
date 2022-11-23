import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonIcon, SkeletonText } from '@carbon/react';
import { ExtensionSlot, useConfig, interpolateString, ConfigurableLink, age } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';
import styles from './compact-patient-banner.scss';
import { parseDate, EthiopicCalendar, toCalendar, CalendarDate } from '@internationalized/date';

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  selectPatientAction?: (evt: any, index: number) => void;
}

const PatientSearchResults = React.forwardRef<HTMLDivElement, PatientSearchResultsProps>(
  ({ patients, selectPatientAction }, ref) => {
    const config = useConfig();
    const { t } = useTranslation();

    const getGender = (gender) => {
      switch (gender) {
        case 'M':
          return t('male', 'Male');
        case 'F':
          return t('female', 'Female');
        case 'O':
          return t('other', 'Other');
        case 'U':
          return t('unknown', 'Unknown');
        default:
          return gender;
      }
    };
    const gregToEth = (gregdate) => {
      if (!gregdate) {
        return null;
      }
      var newDate = new Date(gregdate);
      if (true) {
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
        const date = newDate.getDate();
        let gregorianDate = new CalendarDate(year, month, date);
        let ethiopianDate = toCalendar(gregorianDate, new EthiopicCalendar());
        let finalDate = ethiopianDate.month + '/' + ethiopianDate.day + '/' + ethiopianDate.year;
        return finalDate;
      } else {
        return null;
      }
    };

    const fhirPatients = useMemo(() => {
      // TODO: If/When the online patient search is migrated to the FHIR API at some point, this could
      // be removed. In fact, it could maybe be done at this point already, but doing it when the
      // search returns FHIR objects is much simpler because the code which uses the `fhirPatients`
      // doesn't have to be touched then.
      return patients.map((patient) => {
        const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
        return {
          id: patient.uuid,
          name: [
            {
              given: [patient.person.personName.givenName, patient.person.personName.middleName],
              family: patient.person.personName.familyName,
            },
          ],
          gender: patient.person.gender,
          birthDate: gregToEth(patient.person.birthdate),
          deceasedDateTime: patient.person.deathDate,
          deceasedBoolean: patient.person.death,
          identifier: patient.identifiers,
          address: preferredAddress
            ? [
                {
                  city: preferredAddress.cityVillage,
                  country: preferredAddress.country,
                  postalCode: preferredAddress.postalCode,
                  state: preferredAddress.stateProvince,
                  use: 'home',
                },
              ]
            : [],
          telecom: patient.attributes?.filter((attribute) => attribute.attributeType.display == 'Telephone Number'),
        };
      });
    }, [patients]);

    return (
      <div ref={ref}>
        {fhirPatients.map((patient, indx) => (
          <ConfigurableLink
            onClick={(evt) => selectPatientAction(evt, indx)}
            to={`${interpolateString(config.search.patientResultUrl, {
              patientUuid: patient.id,
            })}/${encodeURIComponent(config.search.redirectToPatientDashboard)}`}
            key={patient.id}
            className={styles.patientSearchResult}>
            <div className={styles.patientAvatar} role="img">
              <ExtensionSlot
                extensionSlotName="patient-photo-slot"
                state={{
                  patientUuid: patient.id,
                  patientName: `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`,
                  size: 'small',
                }}
              />
            </div>
            <div>
              <h2 className={styles.patientName}>{`${patient.name?.[0]?.given?.join(' ')} ${
                patient.name?.[0]?.family
              }`}</h2>
              <p className={styles.demographics}>
                {getGender(patient.gender)} <span className={styles.middot}>&middot;</span> {age(patient.birthDate)}{' '}
                <span className={styles.middot}>&middot;</span> {patient.identifier?.[0]?.identifier}
              </p>
            </div>
          </ConfigurableLink>
        ))}
      </div>
    );
  },
);

export const SearchResultSkeleton = () => {
  return (
    <div className={styles.patientSearchResult}>
      <div className={styles.patientAvatar} role="img">
        <SkeletonIcon
          style={{
            height: '3rem',
            width: '3rem',
          }}
        />
      </div>
      <div>
        <h2 className={styles.patientName}>
          <SkeletonText />
        </h2>
        <span className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span> <SkeletonIcon />{' '}
          <span className={styles.middot}>&middot;</span> <SkeletonIcon />
        </span>
      </div>
    </div>
  );
};

export default PatientSearchResults;
