const attributes = {
    username: {type: 'text', mandatory: true, key: 'unique', editable: true},
    password: {type: 'text', mandatory: true, key: 'non', editable: true},
    email: {type: 'text', mandatory: true, key: 'non', editable: true},
    phone: {type: 'text', mandatory: true, key: 'non', editable: true},
    fullname: {type: 'text', mandatory: true, key: 'non', editable: true},
    type: {type: 'text', mandatory: true, key: 'non', editable: true},
    company: {type: 'text', mandatory: true, key: 'non', editable: true},
    employeecode: {type: 'text', mandatory: true, key: 'non', editable: true}
}

const AccountsBulkFormat = [
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.type])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.mandatory ? 'mandatory' : 'optional'])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.key === 'unique' ? 'unique key' : value.key === 'non' ? 'non key' : value.key])),
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.editable ? 'editable' : 'noneditable']))
];

export default AccountsBulkFormat;