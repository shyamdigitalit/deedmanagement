const attributes = {
    plant_code: {type: 'text', mandatory: true, key: 'unique', editable: true},
    plant_name: {type: 'text', mandatory: true, key: 'non', editable: true},
    company_code: {type: 'text', mandatory: true, key: 'non', editable: true},
    state_code: {type: 'text', mandatory: true, key: 'non', editable: true},
    state_name: {type: 'text', mandatory: true, key: 'non', editable: true},
}

const PlantBulkFormat = [
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.type])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.mandatory ? 'mandatory' : 'optional'])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.key === 'unique' ? 'unique key' : value.key === 'non' ? 'non key' : value.key])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.editable ? 'editable' : 'noneditable']))
];

export default PlantBulkFormat;