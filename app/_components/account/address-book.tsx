"use client";

import dynamic from "next/dynamic";
import { PencilLine, Plus, Save, Star, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  getBarangayOptions,
  getMunicipalityOptions,
  getProvinceOptions,
  regionOptions,
} from "@/app/_lib/philippine-address";

const AddressLeafletMap = dynamic(
  () => import("./address-leaflet-map"),
  { ssr: false }
);

export type AddressDraft = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  region_code: string;
  province_code: string;
  municipality_code: string;
  address_line_1: string;
  address_line_2: string;
  barangay: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  latitude: string;
  longitude: string;
  formatted_address: string;
  geofence_radius_meters: string;
  is_default: boolean;
};

const PROFILE_ADDRESSES_STORAGE_KEY = "riceproject_profile_addresses";
const ADDRESS_LABEL_OPTIONS = ["Home", "Work", "Office", "Apartment", "Other"];

function formatMobileNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.startsWith("63") ? digits.slice(2) : digits;
  const trimmedDigits = localDigits.slice(0, 10);
  const normalizedDigits =
    trimmedDigits.length > 0 && trimmedDigits[0] === "0"
      ? trimmedDigits.slice(1)
      : trimmedDigits;

  const part1 = normalizedDigits.slice(0, 4);
  const part2 = normalizedDigits.slice(4, 7);
  const part3 = normalizedDigits.slice(7, 10);

  let formatted = "+63";

  if (part1) {
    formatted += ` ${part1}`;
  } else {
    formatted += " ";
  }

  if (part2) {
    formatted += `-${part2}`;
  }

  if (part3) {
    formatted += `-${part3}`;
  }

  return formatted;
}

function createEmptyAddressDraft(name: string, mobile: string): AddressDraft {
  return {
    id: "address-default",
    label: "",
    recipient_name: name,
    phone: mobile ? formatMobileNumber(mobile) : "",
    region_code: "",
    province_code: "",
    municipality_code: "",
    address_line_1: "",
    address_line_2: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "PH",
    latitude: "",
    longitude: "",
    formatted_address: "",
    geofence_radius_meters: "10",
    is_default: false,
  };
}

function normalizeAddressShape(
  address: Partial<AddressDraft>,
  name: string,
  mobile: string
): AddressDraft {
  return {
    ...createEmptyAddressDraft(name, mobile),
    ...address,
    region_code: address.region_code ?? "",
    province_code: address.province_code ?? "",
    municipality_code: address.municipality_code ?? "",
    geofence_radius_meters: address.geofence_radius_meters || "10",
  };
}

function formatAddress(address: AddressDraft) {
  return [
    address.address_line_1,
    address.address_line_2,
    address.barangay,
    address.city,
    address.province,
    address.postal_code,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
}

function normalizeDefault(addresses: AddressDraft[]) {
  if (addresses.length === 0) {
    return addresses;
  }

  const defaultIndex = addresses.findIndex((address) => address.is_default);

  const normalizedAddresses =
    defaultIndex === -1
      ? addresses.map((address, index) => ({
          ...address,
          is_default: index === 0,
        }))
      : addresses.map((address, index) => ({
          ...address,
          is_default: index === defaultIndex,
        }));

  return normalizedAddresses.sort((leftAddress, rightAddress) => {
    if (leftAddress.is_default === rightAddress.is_default) {
      return 0;
    }

    return leftAddress.is_default ? -1 : 1;
  });
}

type AccountAddressBookProps = {
  userMobile: string;
  userName: string;
};

export default function AccountAddressBook({
  userMobile,
  userName,
}: AccountAddressBookProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mapTheme, setMapTheme] = useState<"street" | "satellite">("satellite");
  const [addresses, setAddresses] = useState<AddressDraft[]>(() => {
    if (typeof window === "undefined") {
      return [
        {
          ...createEmptyAddressDraft(userName, userMobile),
          is_default: true,
        },
      ];
    }

    const stored = window.localStorage.getItem(PROFILE_ADDRESSES_STORAGE_KEY);

    if (!stored) {
      return [
        {
          ...createEmptyAddressDraft(userName, userMobile),
          is_default: true,
        },
      ];
    }

    try {
      const parsed = JSON.parse(stored) as Partial<AddressDraft>[];
      return parsed.length > 0
        ? normalizeDefault(
            parsed.map((address, index) => {
              const normalized = normalizeAddressShape(
                address,
                userName,
                userMobile
              );

              return {
                ...normalized,
                id: address.id || `address-${index + 1}`,
              };
            })
          )
        : [
            {
              ...createEmptyAddressDraft(userName, userMobile),
              is_default: true,
            },
          ];
    } catch {
      return [
        {
          ...createEmptyAddressDraft(userName, userMobile),
          is_default: true,
        },
      ];
    }
  });
  const [selectedAddressId, setSelectedAddressId] = useState(
    () =>
      addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id ?? ""
  );

  const persistAddresses = (nextAddresses: AddressDraft[]) => {
    const normalized = normalizeDefault(nextAddresses);
    setAddresses(normalized);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PROFILE_ADDRESSES_STORAGE_KEY,
        JSON.stringify(normalized)
      );
    }
  };

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ??
    addresses[0] ??
    null;

  const selectedLatitude = selectedAddress?.latitude.trim()
    ? Number(selectedAddress.latitude)
    : null;
  const selectedLongitude = selectedAddress?.longitude.trim()
    ? Number(selectedAddress.longitude)
    : null;
  const geofenceRadius = Number(selectedAddress?.geofence_radius_meters || "10") || 10;
  const provinceOptions = useMemo(
    () => getProvinceOptions(selectedAddress?.region_code ?? ""),
    [selectedAddress?.region_code]
  );
  const municipalityOptions = useMemo(
    () => getMunicipalityOptions(selectedAddress?.province_code ?? ""),
    [selectedAddress?.province_code]
  );
  const barangayOptions = useMemo(
    () => getBarangayOptions(selectedAddress?.municipality_code ?? ""),
    [selectedAddress?.municipality_code]
  );

  const updateAddress = (addressId: string, patch: Partial<AddressDraft>) => {
    const nextAddresses = addresses.map((address) =>
      address.id === addressId ? { ...address, ...patch } : address
    );
    persistAddresses(nextAddresses);
  };

  const handleAddAddress = () => {
    const nextAddress = {
      ...createEmptyAddressDraft(userName, userMobile),
      id: `address-${crypto.randomUUID()}`,
    };
    const nextAddresses = [...addresses, nextAddress];
    persistAddresses(nextAddresses);
    setSelectedAddressId(nextAddress.id);
    setIsEditing(true);
  };

  const handleRemoveAddress = (addressId: string) => {
    if (addresses.length <= 1) {
      return;
    }

    const nextAddresses = addresses.filter((address) => address.id !== addressId);
    persistAddresses(nextAddresses);

    if (selectedAddressId === addressId) {
      setSelectedAddressId(
        nextAddresses.find((address) => address.is_default)?.id ??
          nextAddresses[0]?.id ??
          ""
      );
    }
  };

  const handleSetDefault = (addressId: string) => {
    persistAddresses(
      addresses.map((address) => ({
        ...address,
        is_default: address.id === addressId,
      }))
    );
    setSelectedAddressId(addressId);
  };

  const addressList = useMemo(
    () =>
      addresses.map((address) => ({
        ...address,
        summary: formatAddress(address),
      })),
    [addresses]
  );

  const handleRegionChange = (regionCode: string) => {
    if (!selectedAddress) {
      return;
    }

    updateAddress(selectedAddress.id, {
      region_code: regionCode,
      province_code: "",
      province: "",
      municipality_code: "",
      city: "",
      barangay: "",
      postal_code: "",
    });
  };

  const handleProvinceChange = (provinceCode: string) => {
    if (!selectedAddress) {
      return;
    }

    const province = provinceOptions.find((item) => item.prov_code === provinceCode);

    updateAddress(selectedAddress.id, {
      province_code: provinceCode,
      province: province?.name ?? "",
      municipality_code: "",
      city: "",
      barangay: "",
      postal_code: "",
    });
  };

  const handleMunicipalityChange = (municipalityCode: string) => {
    if (!selectedAddress) {
      return;
    }

    const municipality = municipalityOptions.find(
      (item) => item.mun_code === municipalityCode
    );

    updateAddress(selectedAddress.id, {
      municipality_code: municipalityCode,
      city: municipality?.name ?? "",
      barangay: "",
    });
  };

  const handleBarangayChange = (barangayName: string) => {
    if (!selectedAddress) {
      return;
    }

    updateAddress(selectedAddress.id, {
      barangay: barangayName,
    });
  };

  return (
    <section className="rounded-[2rem] border border-[#ddd9c6] bg-white/92 p-5 shadow-[0_22px_50px_rgba(78,95,58,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b7a60]">
            Addresses
          </p>
          {/* <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d7452]">
            Save multiple addresses, choose one default, and pin each location on OpenStreetMap for future geofencing.
          </p> */}
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleAddAddress}
            className="inline-flex items-center gap-2 rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512]"
          >
            <Plus className="h-4 w-4" />
            Address
          </button>
        </div>
      </div>

      <div className="mt-2 grid gap-3">
        {addressList.map((address) => {
          const isSelected = address.id === selectedAddressId;

          return (
            <div
              key={address.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedAddressId(address.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedAddressId(address.id);
                }
              }}
              aria-pressed={isSelected}
              className={`rounded-[1.4rem] border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)] ${
                isSelected
                  ? "border-[var(--color-rice-green)] bg-[#f3f7ed]"
                  : "border-[#e5e0cc] bg-[#faf7ee] hover:bg-[#f4efdf]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#2f3b1f]">
                      {address.label.trim() || "Untitled address"}
                    </p>
                    {address.is_default ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#edf4e4] px-2.5 py-1 text-[11px] font-semibold text-[#4d6b35]">
                        <Star className="h-3.5 w-3.5" />
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                    {address.summary || "No address details yet."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.is_default ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#5f6848] transition hover:bg-[#f8f5ea]"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Set Default
                    </button>
                  ) : null}
                  {addresses.length > 1 ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveAddress(address.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#e3d6c0] bg-white px-3 py-2 text-xs font-semibold text-[#8a5b2b] transition hover:bg-[#fff8ef]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAddress ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
          <div className="flex flex-col rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#2f3b1f]">
                  Address Details
                </p>
                <p className="text-sm leading-6 text-[#6d7452]">
                  Configure the address details and pin the location on the map for geofencing during deliveries.
                </p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d8d4be] bg-white px-3 py-2 text-xs font-semibold text-[#4e5a3d] transition hover:bg-[#f8f5ea]"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="flex h-full flex-1 flex-col">
                <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={selectedAddress.label} onChange={(event) => updateAddress(selectedAddress.id, { label: event.target.value })} className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]">
                    <option value="">Select address label</option>
                    {ADDRESS_LABEL_OPTIONS.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input type="tel" inputMode="tel" value={selectedAddress.phone} onChange={(event) => updateAddress(selectedAddress.id, { phone: formatMobileNumber(event.target.value) })} placeholder="+63 9266-301-717" className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]" />
                </div>
                <input type="text" value={selectedAddress.address_line_1} onChange={(event) => updateAddress(selectedAddress.id, { address_line_1: event.target.value })} placeholder="Address line 1" className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]" />
                <input type="text" value={selectedAddress.address_line_2} onChange={(event) => updateAddress(selectedAddress.id, { address_line_2: event.target.value })} placeholder="Address line 2" className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]" />
                <select value={selectedAddress.region_code} onChange={(event) => handleRegionChange(event.target.value)} className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]">
                  <option value="">Select region</option>
                  {regionOptions.map((region) => (
                    <option key={region.reg_code} value={region.reg_code}>
                      {region.name}
                    </option>
                  ))}
                </select>
                <div className="grid gap-3 sm:grid-cols-3">
                  <select value={selectedAddress.province_code} onChange={(event) => handleProvinceChange(event.target.value)} disabled={!selectedAddress.region_code} className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition disabled:cursor-not-allowed disabled:bg-[#f2efe4] focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]">
                    <option value="">Select province</option>
                    {provinceOptions.map((province) => (
                      <option key={province.prov_code} value={province.prov_code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <select value={selectedAddress.municipality_code} onChange={(event) => handleMunicipalityChange(event.target.value)} disabled={!selectedAddress.province_code} className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition disabled:cursor-not-allowed disabled:bg-[#f2efe4] focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]">
                    <option value="">Select city / municipality</option>
                    {municipalityOptions.map((municipality) => (
                      <option
                        key={municipality.mun_code}
                        value={municipality.mun_code}
                      >
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                  <input type="text" value={selectedAddress.postal_code} onChange={(event) => updateAddress(selectedAddress.id, { postal_code: event.target.value })} placeholder="Postal code" className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={selectedAddress.barangay} onChange={(event) => handleBarangayChange(event.target.value)} disabled={!selectedAddress.municipality_code} className="rounded-xl border border-[#d8d4be] bg-white px-4 py-3 text-sm text-[#2f3b1f] outline-none transition disabled:cursor-not-allowed disabled:bg-[#f2efe4] focus:border-[var(--color-rice-green)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--color-rice-green)_18%,transparent)]">
                    <option value="">Select barangay</option>
                    {barangayOptions.map((barangay) => (
                      <option key={barangay.name} value={barangay.name}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-xl border border-[#d8d4be] bg-[#f7f4ea] px-4 py-3 text-sm text-[#2f3b1f]">
                    {selectedAddress.city || "Selected city / municipality will appear here"}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" value={selectedAddress.latitude} readOnly placeholder="Latitude" className="rounded-xl border border-[#d8d4be] bg-[#f7f4ea] px-4 py-3 text-sm text-[#2f3b1f] outline-none" />
                  <input type="text" value={selectedAddress.longitude} readOnly placeholder="Longitude" className="rounded-xl border border-[#d8d4be] bg-[#f7f4ea] px-4 py-3 text-sm text-[#2f3b1f] outline-none" />
                </div>
                <div className="rounded-2xl border border-dashed border-[#d8d4be] bg-white/70 px-4 py-3 text-sm leading-6 text-[#6d7452]">
                  Pin the exact location on the map to set the latitude and longitude for this address.
                </div>
                <div className="mt-auto flex flex-col gap-3 border-t border-[#e5e0cc] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d4be] bg-[#faf7ee] px-4 py-3 text-sm font-semibold text-[#364127] transition hover:bg-[#f4efdf] sm:w-auto"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#253119] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2512] sm:w-auto"
                  >
                    <Save className="h-4 w-4" />
                    Save Address
                  </button>
                </div>
              </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                    Selected Address
                  </p>
                  <p className="mt-2 font-medium text-[#364127]">
                    {selectedAddress
                      ? formatAddress(selectedAddress) || "No address details yet."
                      : "No address details yet."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Address Label
                    </p>
                    <p className="mt-2 font-medium text-[#364127]">
                      {selectedAddress?.label || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9a987b]">
                      Contact Phone
                    </p>
                    <p className="mt-2 font-medium text-[#364127]">
                      {selectedAddress?.phone || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-[#e5e0cc] bg-[#faf7ee] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#2f3b1f]">
                  Pin Map Location
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6d7452]">
                  {isEditing
                    ? "Click the map to drop a location pin for the selected address."
                    : "View the saved location pin for the selected address."}
                </p>
              </div>
              <div className="inline-flex rounded-full border border-[#d8d4be] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMapTheme("street")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    mapTheme === "street"
                      ? "bg-[#253119] text-white"
                      : "text-[#536042]"
                  }`}
                >
                  Street
                </button>
                <button
                  type="button"
                  onClick={() => setMapTheme("satellite")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    mapTheme === "satellite"
                      ? "bg-[#253119] text-white"
                      : "text-[#536042]"
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>
            <div className="mt-4">
              <AddressLeafletMap
                className="h-72 xl:h-[560px]"
                mapTheme={mapTheme}
                geofenceRadiusMeters={geofenceRadius}
                isInteractive={isEditing}
                latitude={selectedLatitude}
                longitude={selectedLongitude}
                onPickLocation={(latitude, longitude) =>
                  updateAddress(selectedAddress.id, {
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6),
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
