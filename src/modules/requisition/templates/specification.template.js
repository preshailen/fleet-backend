const specificationTemplate = (req) => {

  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatValue(value) {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return escapeHtml(value);
  }

  function formatNumber(value) {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return escapeHtml(value);
  }

  function formatCurrency(value) {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') {
      return `R ${value.toLocaleString()}`;
    }
    return `R ${escapeHtml(value)}`;
  }

  const accessories = formatValue(req.accessories);

  const text = `
    A vehicle requisition has been submitted by ${formatValue(req.requestingEmployee)} from the ${formatValue(req.department)} department at ${formatValue(req.companyName)}.

    The requested vehicle is a ${formatValue(req.vehicleType)} (${formatValue(req.make)} ${formatValue(req.model)}) with a ${formatValue(req.engineSize)} engine, ${formatValue(req.fuelType)} fuel type, and ${formatValue(req.transmission)} transmission. The preferred colour is ${formatValue(req.colourPreference)}.

    Intended use: ${formatValue(req.intendedUse)}. Purpose of the requisition: ${formatValue(req.purpose)}. Agreement type: ${formatValue(req.type)}${
      req.type === 'Operating Lease with maintenance'
        ? ` with a term of ${formatValue(req.term)} months`
        : ''
    }.

    Additional requirements include: ${accessories}. ${formatValue(req.vehicleAdditionalInfo)}.

    The justification provided is: ${formatValue(req.basicAdditionalInfo)}.

    Estimated monthly mileage is ${formatNumber(req.estimatedMonthlyKms)} km.

    Financial details indicate an available budget of ${formatCurrency(req.budgetAvailable)} and an estimated vehicle cost of ${formatCurrency(req.estimatedVehicleCost)}. The cost centre is ${formatValue(req.costCentre)}.

    Compliance requirements are as follows: insurance (${formatValue(req.insurance)}), vehicle tracking (${formatValue(req.vehicleTracking)}), roadworthy certification (${formatValue(req.roadworthy)}), and licensing & registration (${formatValue(req.licensingAndRegistration)}).

    The vehicle should be delivered to ${formatValue(req.nameOfDriverAssigned)}. 

    Contact details for this requisition include ${formatValue(req.requestingEmployee)} (${formatValue(req.contactEmail)}) with contact number ${formatValue(req.contactNumber)}.
  `;

  return `
    <p style="font-family:Segoe UI, Arial, sans-serif; font-size:14px; line-height:1.7; color:#2c3e50;">
      ${text.replace(/\n\s+/g, ' ').trim()}
    </p>
  `;
};

export default specificationTemplate;