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
        let query = (
            `SELECT j.id
                    j.title,
                    j.salary,
                    j.equity,
                    j.company_handle as "companyHandle",
                    c.name as "companyName"
            FROM jobs j
                LEFT JOIN companies as c ON c.handle = j.company_handle;`)
        
        let whereExpressions = []
        let queryValues = []

        if (minSalary !== undefined) {
            queryValues.push(minSalary)
            whereExpressions.push(`salary >= $${queryValues.length}`)
        }
      
        if (hasEquity === true) {
            whereExpressions.push(`equity > 0`)
        }
      
        if (title !== undefined) {
            queryValues.push(`%${title}%`)
            whereExpressions.push(`title ILIKE $${queryValues.length}`)
        }
      
        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ")
        }
      
          // Finalize query and return results
      
          query += " ORDER BY title";
          const jobsRes = await db.query(query, queryValues)
          return jobsRes.rows
    }

    /** Given a job's ID, return data about job.
     * 
     *  Returns { id, title, salary, equity, companyHandle, company }
     *  company is presented as { handle, name, description, numEmployees, logoUrl }
     * 
     *  Throws NotFoundError (404) if not found. 
     */

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`, [id])
        
        const job = jobRes.rows[0]

        if (!job) throw new NotFoundError(`No job: ${id}`)

        const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`, [job.companyHandle])

        delete job.companyHandle
        job.company = companiesRes.rows[0]

        return job
    }

    static async update(id, data) {

    }

    static async remove(id) {
        
    }
}