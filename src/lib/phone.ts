// Links for tapping a South African number on a phone.
export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
export function whatsappHref(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("0")) d = "27" + d.slice(1);
  return `https://wa.me/${d}`;
}
export const mapsHref = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
