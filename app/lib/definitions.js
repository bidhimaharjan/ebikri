// This file contains type definitions for your data.
// These are used as guidelines for understanding the structure of the data.

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} image_url
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} customer_id
 * @property {number} amount
 * @property {string} date
 * @property {'pending' | 'paid'} status
 */

/**
 * @typedef {Object} Revenue
 * @property {string} month
 * @property {number} revenue
 */

/**
 * @typedef {Object} LatestInvoice
 * @property {string} id
 * @property {string} name
 * @property {string} image_url
 * @property {string} email
 * @property {string} amount
 */

/**
 * @typedef {Object} LatestInvoiceRaw
 * @property {string} id
 * @property {string} name
 * @property {string} image_url
 * @property {string} email
 * @property {number} amount
 */

/**
 * @typedef {Object} InvoicesTable
 * @property {string} id
 * @property {string} customer_id
 * @property {string} name
 * @property {string} email
 * @property {string} image_url
 * @property {string} date
 * @property {number} amount
 * @property {'pending' | 'paid'} status
 */

/**
 * @typedef {Object} CustomersTableType
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} image_url
 * @property {number} total_invoices
 * @property {number} total_pending
 * @property {number} total_paid
 */

/**
 * @typedef {Object} FormattedCustomersTable
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} image_url
 * @property {number} total_invoices
 * @property {string} total_pending
 * @property {string} total_paid
 */

/**
 * @typedef {Object} CustomerField
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} InvoiceForm
 * @property {string} id
 * @property {string} customer_id
 * @property {number} amount
 * @property {'pending' | 'paid'} status
 */
