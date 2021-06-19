"use strict"

const db = require("../db")
const { NotFoundError } = require("../expressError")
const { sqlForPartialUpdate } = require("../helpers/sql")

/**
 * Job model and related methods and functions
 */

class Job {
    /**
     * Create a job (from valid JSON data),
     * update the db, and return the new data
     * 
     * data should include { title, salary, equity, companyHandle }
     * 
     * Will return { id, title, salary, equity, companyHandle }
     */

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title, data.salary, data.equity, data.companyHandle])

        let job = result.rows[0]
        return job
    }

    /**
     * Find all jobs (optional filters as args, much like the company findAll)
     * 
     * Will create dynamic queries based on what is passed
     * Filters:
     * - minSalary,
     * - hasEquity (true returns only jobs where the equity is above 0)
     * - title (will find case-insensitive, partial matches)
     * 
     * returns [{ id, title, salary, equity, companyHandle, companyName }]
     */

    static async findAll({ minSalary, hasEquity, title } = {}) {
        
    }

    static async get(id) {

    }

    static async update(id, data) {

    }

    static async remove(id) {
        
    }
}