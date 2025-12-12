import mongoose from 'mongoose'

const { Schema, model, Types } = mongoose

const DeedSchema = new Schema({}, { timestamps: true })

export default model('Deed', DeedSchema)