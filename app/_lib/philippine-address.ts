import phil from "phil-reg-prov-mun-brgy";

export type PhilippineRegion = {
  name: string;
  reg_code: string;
};

export type PhilippineProvince = {
  name: string;
  reg_code: string;
  prov_code: string;
};

export type PhilippineMunicipality = {
  name: string;
  prov_code: string;
  mun_code: string;
};

export type PhilippineBarangay = {
  name: string;
  mun_code: string;
};

type PhilippineAddressLibrary = {
  regions: PhilippineRegion[];
  getProvincesByRegion: (regionCode: string) => PhilippineProvince[];
  getCityMunByProvince: (provinceCode: string) => PhilippineMunicipality[];
  getBarangayByMun: (municipalityCode: string) => PhilippineBarangay[];
  sort: <T extends { name: string }>(items: T[], sort?: "A" | "Z") => T[];
};

const addressLibrary = phil as PhilippineAddressLibrary;

export const regionOptions = addressLibrary.sort(addressLibrary.regions);

export function getProvinceOptions(regionCode: string) {
  if (!regionCode) {
    return [] as PhilippineProvince[];
  }

  const provinces = addressLibrary.getProvincesByRegion(regionCode);
  
  // Deduplicate by prov_code
  const seen = new Set();
  const uniqueProvinces = provinces.filter((province) => {
    if (seen.has(province.prov_code)) {
      return false;
    }
    seen.add(province.prov_code);
    return true;
  });

  return addressLibrary.sort(uniqueProvinces);
}

export function getMunicipalityOptions(provinceCode: string) {
  if (!provinceCode) {
    return [] as PhilippineMunicipality[];
  }

  return addressLibrary.sort(addressLibrary.getCityMunByProvince(provinceCode));
}

export function getBarangayOptions(municipalityCode: string) {
  if (!municipalityCode) {
    return [] as PhilippineBarangay[];
  }

  return addressLibrary.sort(addressLibrary.getBarangayByMun(municipalityCode));
}
