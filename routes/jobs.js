"use strict";

const jsonschema = require("jsonschema")

const express = require("express")
const { BadRequestError } = require("../expressError")
const { ensureAdmin } = require("../middleware/auth")
const Job = require("../models/job")
const jobNewSchema = require("../schemas/jobNew.json")
const jobUpdateSchema = require("../schemas/companyUpdate.json")
const jobSearchSchema = require("../schemas/jobSearch.json")

const router = express.Router({ mergeParams: true })

/** POST / { job } => { job }
 * 
 *  job should be { title, salary, equity, companyHandle }
 * 
 *  Returns { id, title, salary, equity, companyHandle }
 * 
 *  Authorization required: creator of new Job should be an adminn.
 */

router.post("/", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const job = await Job.create({ job })
        return res.status(201).json({ job })
    }

    catch(e) {
        return next(e)
    }
})

/** GET / =>
 * 
 * { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ... ] }
 * 
 *  Can provide optional search terms in query:
 *  - minSalary
 *  - hasEquity (jobs with equity > 0 will only return true, other values will be ignored)
 *  - title (runs ILIKE query for partial, case-insensitive etc matches)
 * 
 *  No authorization required for this route.
 * 
 */

router.get("/", async (req, res, next) => {
    const q = req.query
    // if minSalary is attached, turn into int/boolean
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary
    q.hasEquity = q.hasEquity === "true"
    try {
        const validator = jsonschema.validate(q, jobSearchSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const jobs = await Job.findAll(q)
        return res.json({ jobs })
    } 
    
    catch (e) {
        return next(e)
    }
})

/** GET /[jobId] => { job }
 * 
 *  Returns { id, title, salary, equity, company }
 *  where company is { handle, name, description, numEmployees, logoUrl }
 * 
 *  No authorization required.
 */

router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id)
        return res.json({ job })
    } catch(e) {
        return next(e)
    }
})

/** PATCH /[jobId] { fieldOne, fieldTwo, ... } => { job }
 * 
 *  Data can include { title, salary, equity } and must have at least one of these fields.
 * 
 *  Returns { id, title, salary, equity, companyHandle }
 * 
 *  Admin authorization required for this method/route. 
 */

router.patch(":/id", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const job = await Job.update(req.params.id, req.body)
        return res.json({ job })
    } catch(e) { 
        return next(e)
    }
})

/** DELETE /[id] => { deleted: id }
 * 
 *  Admin authorization required for this method/route.
 */

router.delete(":/id", ensureAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id)
        return res.json({ deleted: +req.params.id })
    } catch(e) {
        return next(e)
    }
})

module.exports = router