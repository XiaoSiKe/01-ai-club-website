export const atlasPalettes = {
  dark: {
    ink: '#f5f5f5', bg: '#101010', panel: '#111111', land: '#1b1b1b',
    world: '#171717', line: '#777777', worldLine: '#404040', grid: '#ffffff09',
    border: '#ffffff12', muted: '#aaaaaa', quiet: '#949494', active: '#ffffff05', highlight: '#353535',
    street: '#555555', minorStreet: '#343434', building: '#242424', buildingLine: '#3b3b3b',
    water: '#292929', green: '#1c1c1c', neighborhood: '#151515', campus: '#202020',
  },
  light: {
    ink: '#202020', bg: '#f6f6f6', panel: '#fafafa', land: '#fafafa',
    world: '#e7e7e7', line: '#929292', worldLine: '#cccccc', grid: '#20202009',
    border: '#20202018', muted: '#606060', quiet: '#707070', active: '#00000004', highlight: '#d5d5d5',
    street: '#b6b6b6', minorStreet: '#d5d5d5', building: '#e2e2e2', buildingLine: '#c9c9c9',
    water: '#d5d5d5', green: '#e8e8e8', neighborhood: '#f0f0f0', campus: '#eaeaea',
  },
};

export const atlasStyles = Object.fromEntries(Object.entries(atlasPalettes).map(([theme, palette]) => [theme,
  Object.fromEntries(Object.entries(palette).map(([name, value]) => [`--atlas-${name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`, value])),
]));
