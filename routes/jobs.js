'use strict';

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require('express');
const Job = require('../models/job');
const { ensureAdmin } = require('../middleware/auth');
const { BadRequestError } = require('../expressError');
const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');
const jobSearchSchema = require('../schemas/jobSearch.json');

const router = express.Router({ mergeParams: true });

/** POST /jobs { job } => { job }
 *
 * Adds a new job to the database.
 *
 * This returns the new job:
 *   { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post('/', ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /jobs => { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Returns list of all jobs.
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 *
 * Authorization required: none
 */

router.get('/', async function (req, res, next) {
    const q = req.query;
    // convert from string to integers/boolean
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";
  
    try {
      const validator = jsonschema.validate(q, jobSearchSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
    const jobs = await Job.findAll(q);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /jobs/[id] => { job }
 *
 * Returns { id, title, salary, equity, companyHandle, company }
 * where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /jobs/[id] { data } => { job }
 *
 * Updates job with matching id.
 *
 * This returns the updated job:
 * { id, title, salary, equity, companyHandle }
 *
 * Data can include:
 * { title, salary, equity }
 *
 * Authorization required: admin
 */

router.patch('/:id', ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /jobs/[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete('/:id', ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
