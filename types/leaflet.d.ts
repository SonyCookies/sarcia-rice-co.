declare module "leaflet" {
  export type LatLngTuple = [number, number];
  export type LatLngExpression = LatLngTuple;
  export type LatLngBoundsExpression = [LatLngExpression, LatLngExpression];

  export type DivIconOptions = {
    className?: string;
    html?: string | false;
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  };

  export type MapOptions = {
    center?: LatLngExpression;
    zoom?: number;
    scrollWheelZoom?: boolean;
  };

  export type FitBoundsOptions = {
    padding?: [number, number];
  };

  export type MarkerOptions = {
    icon?: DivIcon;
  };

  export type TileLayerOptions = {
    attribution?: string;
  };

  export type LeafletMouseEvent = {
    latlng: {
      lat: number;
      lng: number;
    };
  };

  export type LeafletEventHandlerFnMap = {
    click?: (event: LeafletMouseEvent) => void;
  };

  export class Map {
    invalidateSize(): void;
  }

  export class Marker<T = unknown> {}

  export class TileLayer {}

  export type DivIcon = {
    options?: DivIconOptions;
  };

  export function divIcon(options?: DivIconOptions): DivIcon;
}
