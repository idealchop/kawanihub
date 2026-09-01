/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appConfig } from '@/config/app-config';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { cn } from '@/lib/utils';
import { BARANGAY_OPTIONS } from '../lib/barangay-list';
import { DEMO_REQUEST_KIND, DEMO_REQUEST_NOTES, demoRequesterIdentity } from '../lib/demo-request';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import {
  BENEFICIARY_RELATIONS,
  NAME_SUFFIXES,
  SOLICITATION_KINDS,
  composePersonNameFrom,
  emptyPersonName,
  emptyRequesterIdentity,
  missingMiddleName,
  type BeneficiaryRelation,
  type PersonName,
  type RequesterIdentity,
  type SolicitationKind,
  type SolicitationWriteInput,
} from '../types/solicitation';
import {
  PictogramBurial,
  PictogramDaily,
  PictogramEducation,
  PictogramEvents,
  PictogramFinancial,
  PictogramMedical,
} from './public-solicit-pictograms';

const kindIcons = {
  burial: PictogramBurial,
  education: PictogramEducation,
  medical: PictogramMedical,
  events: PictogramEvents,
  financial: PictogramFinancial,
  daily: PictogramDaily,
} as const;

export function SolicitationForm({
  onCreate,
  idPrefix = 'solicitation',
  pictureLayout = false,
  showSuccessToast = true,
}: {
  onCreate: (input: SolicitationWriteInput, options?: { demoFilled?: boolean }) => Promise<unknown>;
  idPrefix?: string;
  pictureLayout?: boolean;
  showSuccessToast?: boolean;
}) {
  const { locale } = useLocale();
  const copy = getSolicitationCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [identity, setIdentity] = useState<RequesterIdentity>(emptyRequesterIdentity);
  const [kind, setKind] = useState<SolicitationKind>('burial');
  const [notes, setNotes] = useState('');
  const [demoFilled, setDemoFilled] = useState(false);
  const [pending, setPending] = useState(false);

  function patchIdentity(patch: Partial<RequesterIdentity>) {
    setIdentity((current) => ({ ...current, ...patch }));
  }

  function patchBeneficiary(patch: Partial<PersonName>) {
    setIdentity((current) => ({ ...current, beneficiary: { ...current.beneficiary, ...patch } }));
  }

  function fillDemo() {
    setIdentity(demoRequesterIdentity());
    setKind(DEMO_REQUEST_KIND);
    setNotes(DEMO_REQUEST_NOTES);
    setDemoFilled(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (missingMiddleName(identity) || (!identity.requesterIsBeneficiary && missingMiddleName(identity.beneficiary))) {
      toast.error(copy.middleNameRequired);
      return;
    }
    if (!identity.requesterIsBeneficiary) {
      if (!identity.beneficiary.firstName.trim() || !identity.beneficiary.lastName.trim()) {
        toast.error(copy.beneficiaryRequired);
        return;
      }
      if (!identity.beneficiaryRelation) {
        toast.error(copy.beneficiaryRelationRequired);
        return;
      }
      if (identity.beneficiaryRelation === 'other' && !identity.beneficiaryRelationOther.trim()) {
        toast.error(copy.beneficiaryRelationOtherRequired);
        return;
      }
    }
    const beneficiaryName = identity.requesterIsBeneficiary
      ? composePersonNameFrom(identity)
      : composePersonNameFrom(identity.beneficiary);
    setPending(true);
    try {
      const requesterName = composePersonNameFrom(identity);
      await onCreate({
        requesterName,
        beneficiaryName,
        barangay: identity.barangay,
        contact: identity.mobile,
        idNumber: identity.idNumber,
        identity,
        kind,
        notes,
        relatives: [],
      }, { demoFilled });
      if (showSuccessToast) {
        setIdentity(emptyRequesterIdentity());
        setKind('burial');
        setNotes('');
        setDemoFilled(false);
        toast.success(copy.created);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  const fieldClass = pictureLayout ? 'h-12 text-base' : undefined;
  const labelClass = pictureLayout ? 'text-base' : undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border bg-card p-4 md:p-6" noValidate>
      {appConfig.demoMode ? (
        <Button type="button" variant="outline" className={pictureLayout ? 'h-12 w-full text-base' : undefined} onClick={fillDemo}>
          {copy.fillDemo}
        </Button>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="text-lg font-semibold sm:col-span-2 lg:col-span-4">{copy.fullNameLabel}</h2>
        <PersonNameFields
          idPrefix={`${idPrefix}-requester`}
          value={identity}
          onChange={patchIdentity}
          fieldClass={fieldClass}
          labelClass={labelClass}
          copy={copy}
        />
      </section>

      <section className="grid gap-3">
        <label className={cn('flex items-center gap-3', labelClass)} htmlFor={`${idPrefix}-is-beneficiary`}>
          <Checkbox
            id={`${idPrefix}-is-beneficiary`}
            className={pictureLayout ? 'size-6' : undefined}
            checked={identity.requesterIsBeneficiary}
            onCheckedChange={(checked) =>
              patchIdentity({
                requesterIsBeneficiary: checked === true,
                beneficiary: checked === true ? emptyPersonName() : identity.beneficiary,
                beneficiaryRelation: checked === true ? '' : identity.beneficiaryRelation,
                beneficiaryRelationOther: checked === true ? '' : identity.beneficiaryRelationOther,
              })
            }
          />
          {copy.requesterIsBeneficiary}
        </label>
        {identity.requesterIsBeneficiary ? null : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <h2 className="text-lg font-semibold sm:col-span-2 lg:col-span-4">
              {copy.beneficiaryLabel}
            </h2>
            <PersonNameFields
              idPrefix={`${idPrefix}-beneficiary`}
              value={identity.beneficiary}
              onChange={patchBeneficiary}
              fieldClass={fieldClass}
              labelClass={labelClass}
              copy={copy}
            />
            <div className="space-y-2 sm:col-span-2">
              <Label className={labelClass} htmlFor={`${idPrefix}-beneficiary-relation`}>
                {copy.beneficiaryRelationLabel}
              </Label>
              <Select
                value={identity.beneficiaryRelation || undefined}
                onValueChange={(value) =>
                  patchIdentity({
                    beneficiaryRelation: value as BeneficiaryRelation,
                    beneficiaryRelationOther: value === 'other' ? identity.beneficiaryRelationOther : '',
                  })
                }
              >
                <SelectTrigger id={`${idPrefix}-beneficiary-relation`} className={fieldClass}>
                  <SelectValue placeholder={copy.beneficiaryRelationPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {BENEFICIARY_RELATIONS.map((relation) => (
                    <SelectItem key={relation} value={relation}>
                      {copy.beneficiaryRelations[relation]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {identity.beneficiaryRelation === 'other' ? (
              <div className="space-y-2 sm:col-span-2">
                <Label className={labelClass} htmlFor={`${idPrefix}-beneficiary-relation-other`}>
                  {copy.beneficiaryRelationOtherLabel}
                </Label>
                <Input
                  className={fieldClass}
                  id={`${idPrefix}-beneficiary-relation-other`}
                  value={identity.beneficiaryRelationOther}
                  onChange={(event) => patchIdentity({ beneficiaryRelationOther: event.target.value })}
                />
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">{copy.beneficiaryHint}</p>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <h2 className="text-lg font-semibold md:col-span-2">{copy.addressLabel}</h2>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-building`}>{copy.buildingLabel}</Label>
          <Input className={fieldClass} id={`${idPrefix}-building`} value={identity.building} onChange={(event) => patchIdentity({ building: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-street`}>{copy.streetLabel}</Label>
          <Input className={fieldClass} id={`${idPrefix}-street`} value={identity.street} onChange={(event) => patchIdentity({ street: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-subdivision`}>{copy.subdivisionLabel}</Label>
          <Input className={fieldClass} id={`${idPrefix}-subdivision`} value={identity.subdivision} onChange={(event) => patchIdentity({ subdivision: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-barangay`}>{copy.barangayLabel}</Label>
          <Select value={identity.barangay || undefined} onValueChange={(value) => patchIdentity({ barangay: value })}>
            <SelectTrigger id={`${idPrefix}-barangay`} className={fieldClass}>
              <SelectValue placeholder={copy.barangayLabel} />
            </SelectTrigger>
            <SelectContent>
              {BARANGAY_OPTIONS.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <h2 className="text-lg font-semibold md:col-span-3">{copy.contactLabel}</h2>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-mobile`}>{copy.mobileLabel}</Label>
          <Input className={fieldClass} id={`${idPrefix}-mobile`} inputMode="tel" value={identity.mobile} onChange={(event) => patchIdentity({ mobile: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-telephone`}>{copy.telephoneLabel}</Label>
          <Input className={fieldClass} id={`${idPrefix}-telephone`} inputMode="tel" value={identity.telephone} onChange={(event) => patchIdentity({ telephone: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-email`}>{copy.emailLabel}</Label>
          <Input className={fieldClass} id={`${idPrefix}-email`} type="email" value={identity.email} onChange={(event) => patchIdentity({ email: event.target.value })} />
        </div>
      </section>

      <div className="space-y-2">
        <Label className={labelClass} id={`${idPrefix}-kind`}>{copy.kindLabel}</Label>
        {pictureLayout ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-labelledby={`${idPrefix}-kind`}>
            {SOLICITATION_KINDS.map((key) => {
              const Icon = kindIcons[key];
              const selected = kind === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setKind(key)}
                  className={cn(
                    'flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-3 text-sm font-semibold',
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent',
                  )}
                >
                  <Icon className="size-10" />
                  {copy.kinds[key]}
                </button>
              );
            })}
          </div>
        ) : (
          <Select value={kind} onValueChange={(value) => setKind(value as SolicitationKind)}>
            <SelectTrigger id={`${idPrefix}-kind`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOLICITATION_KINDS.map((key) => (
                <SelectItem key={key} value={key}>
                  {copy.kinds[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="space-y-2">
        <Label className={labelClass} htmlFor={`${idPrefix}-notes`}>{copy.notesLabel}</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={pictureLayout ? 'min-h-32 text-base' : 'min-h-28'}
        />
      </div>
      <Button type="submit" size={pictureLayout ? 'lg' : 'default'} className={pictureLayout ? 'h-12 w-full text-base' : undefined} disabled={pending}>
        {pending ? chrome.saving : copy.add}
      </Button>
    </form>
  );
}

function PersonNameFields({
  idPrefix,
  value,
  onChange,
  fieldClass,
  labelClass,
  copy,
}: {
  idPrefix: string;
  value: PersonName;
  onChange: (patch: Partial<PersonName>) => void;
  fieldClass?: string;
  labelClass?: string;
  copy: ReturnType<typeof getSolicitationCopy>;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label className={labelClass} htmlFor={`${idPrefix}-first`}>{copy.firstNameLabel}</Label>
        <Input className={fieldClass} id={`${idPrefix}-first`} value={value.firstName} onChange={(event) => onChange({ firstName: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label className={labelClass} htmlFor={`${idPrefix}-middle`}>{copy.middleNameLabel}</Label>
        <Input
          className={fieldClass}
          id={`${idPrefix}-middle`}
          value={value.middleName}
          disabled={value.noMiddleName}
          onChange={(event) => onChange({ middleName: event.target.value, noMiddleName: false })}
        />
        <label className={cn('flex items-center gap-2 text-sm', labelClass)} htmlFor={`${idPrefix}-no-middle`}>
          <Checkbox
            id={`${idPrefix}-no-middle`}
            checked={value.noMiddleName}
            onCheckedChange={(checked) => onChange({ noMiddleName: checked === true, middleName: checked === true ? '' : value.middleName })}
          />
          {copy.noMiddleName}
        </label>
      </div>
      <div className="space-y-2">
        <Label className={labelClass} htmlFor={`${idPrefix}-last`}>{copy.lastNameLabel}</Label>
        <Input className={fieldClass} id={`${idPrefix}-last`} value={value.lastName} onChange={(event) => onChange({ lastName: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label className={labelClass} htmlFor={`${idPrefix}-suffix`}>{copy.suffixLabel}</Label>
        <Select value={value.suffix || 'none'} onValueChange={(next) => onChange({ suffix: next === 'none' ? '' : next })}>
          <SelectTrigger id={`${idPrefix}-suffix`} className={fieldClass}>
            <SelectValue placeholder={copy.suffixNone} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{copy.suffixNone}</SelectItem>
            {NAME_SUFFIXES.map((suffix) => (
              <SelectItem key={suffix} value={suffix}>
                {suffix}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
