const attributes = {
    material_code: {type: 'text', mandatory: true, key: 'unique', editable: true},
    material_name: {type: 'text', mandatory: true, key: 'non', editable: true},
    material_desc: {type: 'text', mandatory: true, key: 'non', editable: true},
    material_type: {type: 'text', mandatory: true, key: 'non', editable: true},
    material_group: {type: 'text', mandatory: true, key: 'non', editable: true},
    material_plants: {type: 'text', mandatory: true, key: 'non', editable: true},
}

const MaterialBulkFormat = [
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.type])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.mandatory ? 'mandatory' : 'optional'])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.key === 'unique' ? 'unique key' : value.key === 'non' ? 'non key' : value.key])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.editable ? 'editable' : 'noneditable']))
];

export default MaterialBulkFormat;