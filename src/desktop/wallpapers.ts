// Photo wallpapers (CC0). Full credits and sources: public/wallpapers/CREDITS.md
export interface PhotoWallpaper {
  key: string;
  label: string;
  src: string;
  /** 40px blurred WebP for instant paint. */
  tiny: string;
  credit: string;
}

export const DEFAULT_WALLPAPER = 'lofoten';

export const PHOTOS: PhotoWallpaper[] = [
  { key: 'lofoten', label: 'Lofoten', src: '/wallpapers/lofoten.webp', tiny: 'data:image/webp;base64,UklGRroAAABXRUJQVlA4IK4AAADQBgCdASooABsAPtlapE2oJSOiOrZoAQAbCWIAnTO0iKgnh8Fm0u3k6Y3QNaRjiw8TgCpGM/HHmaqtR5zaK+AA/tJmzxsnQYpsbIYPYYsaci0C10HMaLhxDTgBhRycId0MsxfMQLfiXbxN/41fP5mJ2ka9LPIPpT3M6o5txktmAlG5JpJkouWRjEsZ8Xee+l4GD/vhfxy4gD9x7hx3eux72Nt1GloTfSibbU1gQAA=', credit: 'Photo: Johannes Groll (CC0)' },
  { key: 'waterfall', label: 'Waterfall', src: '/wallpapers/waterfall.webp', tiny: 'data:image/webp;base64,UklGRsQAAABXRUJQVlA4ILgAAADQBgCdASooABsAPu1qqk6ppiQiMBVaqTAdiWYAtSFBVaAGNcgWm1etNR/vq0YeWqbi221sj3ot5JNNFDarmYAA+08fmBoNpYPyK/oR9gfZGVqYZIWr14ndDn+a4saNdrSlwakKuH+9KlPH0JcKEkloMkVGI7ssRwFq8E5pIDmE8WRSpnaUAPr9pV1gLIYb5FhiwpIz/CItZ1nEDVy1wxkBjfIYeemyw7bxX06GF7RDv0H6JZXmQAAA', credit: 'Photo: veeterzy (CC0)' },
  { key: 'coast', label: 'Coast', src: '/wallpapers/coast.webp', tiny: 'data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAADQBACdASooABYAPu1kqE2tJaOmMAgBoB2JYgCpJwABqIYEd7PynoII4dAQf8rQ0AD+6hTBSePZRPn7oPqKnokC94YyvCM1ZtA9rpi4qr+r1NxS9YnRq0mJ8phraab00zxTVjeTL5dHgvMuljlBIYZZskXEHwYVcJCKgAAA', credit: 'Photo: Lance Asper (CC0)' },
  { key: 'forest', label: 'Forest', src: '/wallpapers/forest.webp', tiny: 'data:image/webp;base64,UklGRtgAAABXRUJQVlA4IMwAAACQBgCdASooABsAPu1gqk6ppSOiNVQIATAdiWMAs4AzGJ/US2nMqILebUoDWMQmn3ocKWRuo1oe8F70wlGAAP7szsx9jIjraS3bw+r/RaWoH10ITLV2kH0gjvmpEkxiJjfw6gW+VXlde4yHiKKl9RyXkGD48fUXCflqoVh+TveH/Os+a7iQ1EI9TyPaTacDAykbvDWwGY0nEeT09XRbffYnBIcO67PAKLUH/TgEXzBcLwg5qcLFbWGmR7mCtmtg+WuQqSM7/0X/xIlAAAA=', credit: 'Photo: W.carter (CC0)' },
  { key: 'dusk', label: 'Dusk', src: '/wallpapers/dusk.webp', tiny: 'data:image/webp;base64,UklGRuoAAABXRUJQVlA4IN4AAADwBgCdASooABsAPt1cn02opSKiNVv8ARAbiWoArB2RQv+At9rfl8LYDiLvxo5MBixSJdwACYAw3/en6Ts4HHK4AP5zFf4/WTU9ilNBVwjFIcAdLScnZbamTCOHWxRtpUKViMhfa9kCp5/QcN6rXSATmxXRDHthSXUNRKtnfSuLCZZMGAWWAjco6ASPuM3mJ1QrJOASfkMsVpimKMZ0CPZJCZIxyAYidf1gd7dMXCivUYGvYIM5fBHX01a7q4NZynGwi4QufOIlpsJd/AXBDwIa5ilx+ySMXKK9E/v+oAA=', credit: 'Photo: Sam Ferrara (CC0)' },
  { key: 'night', label: 'Night Sky', src: '/wallpapers/night.webp', tiny: 'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAABwAwCdASooABsAPu1mr1EppSmiqrgKATAdiWUAz2QQIStuHcAA/vCIdzqkyY8zsx7jb5CjfJXvVKyAGhs++pc/DQAAAA==', credit: 'Photo: Paul Volkmer (CC0)' },
  { key: 'wilderness', label: 'Wilderness', src: '/wallpapers/wilderness.webp', tiny: 'data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAACQBQCdASooABsAPulYo02pJKMiNVgMASAdCUAWI/rAtR06hNHxOHqQyFGUlf7DbJDxK/xYAAD+bx795RmySTLC75lOx8rfqKPL4ahsdkAsmMYpOkQP0EM3V59Y8i5HhIQrW9bOghLQ5AFyigyrLo1HQaVYqsgFPNMkAuk2ayL00a4w8ormnogA', credit: 'Photo: David Marcu (CC0)' },
];

export const isPhoto = (key: string): boolean => PHOTOS.some((p) => p.key === key);
