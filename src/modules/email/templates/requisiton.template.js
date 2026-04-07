const requisitionEmailTemplate = (req) => {

  function isEmpty(value) {
    return value === null || value === undefined || value === '';
  }

  function formatCurrency(value) {
    if (isEmpty(value)) return '';
    if (typeof value === 'number') {
      return `R ${value.toLocaleString()}`;
    }
    return `R ${value}`;
  }

  function formatValue(value) {
    if (isEmpty(value)) return '';
    return value;
  }

  function formatBoolean(value) {
    if (isEmpty(value)) return '';
    return value ? 'Yes' : 'No';
  }

  function renderRow(label, value) {
    if (isEmpty(value)) return '';
    return `<tr><td class="label">${label}</td><td>${value}</td></tr>`;
  }

  function renderAccessoriesList(accessories) {
    if (isEmpty(accessories)) return '';

    const items = accessories
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (!items.length) return '';

    return `
      <tr>
        <td class="label">Accessories</td>
        <td>
          <ul style="margin:0; padding-left:18px;">
            ${items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </td>
      </tr>
    `;
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background:#f4f6f8;
        padding:20px;
        margin:0;
      }

      .container{
        max-width:700px;
        margin:auto;
        background:white;
        padding:30px;
        border-radius:10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }

      h2{
        text-align:center;
        margin-bottom:25px;
        color:#333;
      }

      .section-title{
        margin-top:25px;
        margin-bottom:10px;
        font-size:16px;
        font-weight:bold;
        color:#007bff;
        border-bottom:1px solid #eee;
        padding-bottom:5px;
      }

      table{
        width:100%;
        border-collapse:collapse;
      }

      td{
        padding:10px;
        border-bottom:1px solid #eee;
        vertical-align: top;
      }

      .label{
        font-weight:bold;
        width:220px;
        color:#555;
        background:#fafafa;
      }

      .button-container{
        margin-top:30px;
        text-align:center;
      }

      .button{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:12px 22px;
        background:#007bff;
        color:#ffffff !important;
        text-decoration:none;
        border-radius:6px;
        font-weight:bold;
        font-size:14px;
      }

      .button-icon{
        font-size:16px;
        line-height:1;
      }

      .note{
        margin-top:20px;
        font-size:13px;
        color:#666;
        text-align:center;
      }

      .footer{
        margin-top:30px;
        font-size:12px;
        color:#999;
        text-align:center;
      }

    </style>
  </head>

  <body>

  <div class="container">

    <h2>🚗 Vehicle Requisition Request</h2>

    <div class="section-title">Basic Information</div>
    <table>
      ${renderRow('Company Name', formatValue(req.companyName))}
      ${renderRow('Department', formatValue(req.department))}
      ${renderRow('Requesting Employee', formatValue(req.requestingEmployee))}
      ${renderRow('Contact Number', formatValue(req.contactNumber))}
      ${renderRow('Contact Email', formatValue(req.contactEmail))}
      ${renderRow('Driver Assigned', formatValue(req.nameOfDriverAssigned))}
      ${renderRow('Additional Info', formatValue(req.basicAdditionalInfo))}
    </table>

    <div class="section-title">Vehicle Details</div>
    <table>
      ${renderRow('Purpose', formatValue(req.purpose))}
      ${renderRow('Type', formatValue(req.type))}

      ${
        !isEmpty(req.type) && req.type === 'Operating Lease with maintenance' && !isEmpty(req.term)
          ? renderRow('Term', `${formatValue(req.term)} months`)
          : ''
      }

      ${renderRow('Vehicle Type', formatValue(req.vehicleType))}
      ${renderRow('Make', formatValue(req.make))}
      ${renderRow('Model', formatValue(req.model))}
      ${renderRow('Engine Size', formatValue(req.engineSize))}
      ${renderRow('Fuel Type', formatValue(req.fuelType))}
      ${renderRow('Transmission', formatValue(req.transmission))}
      ${renderRow('Colour Preference', formatValue(req.colourPreference))}
      
      ${renderAccessoriesList(req.accessories)}

      ${renderRow('Vehicle Additional Info', formatValue(req.vehicleAdditionalInfo))}
      ${renderRow('Intended Use', formatValue(req.intendedUse))}

      ${
        !isEmpty(req.estimatedMonthlyKms)
          ? renderRow('Estimated Monthly KMs', `${formatValue(req.estimatedMonthlyKms)} KM's`)
          : ''
      }
    </table>

    <div class="section-title">Financial & Compliance</div>
    <table>
      ${renderRow('Cost Centre', formatValue(req.costCentre))}
      ${renderRow('Budget Available', isEmpty(req.budgetAvailable) ? '' : formatCurrency(req.budgetAvailable))}
      ${renderRow('Estimated Vehicle Cost', isEmpty(req.estimatedVehicleCost) ? '' : formatCurrency(req.estimatedVehicleCost))}
      ${renderRow('Insurance', formatBoolean(req.insurance))}
      ${renderRow('Vehicle Tracking', formatBoolean(req.vehicleTracking))}
      ${renderRow('Roadworthy', formatBoolean(req.roadworthy))}
      ${renderRow('Licensing & Registration', formatBoolean(req.licensingAndRegistration))}
    </table>

    <div class="button-container">
      <a href="" class="button">
        <span class="button-icon">🔐</span>
        Go to Login
      </a>
    </div>

    <div class="note">
      If you don't have an account, please sign up and select <b>"Supplier"</b>.
    </div>

    <div class="footer">
      This is an automated message. Please do not reply.
    </div>

  </div>

  </body>
  </html>
  `;
};

export default requisitionEmailTemplate;