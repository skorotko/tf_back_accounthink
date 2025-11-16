select
'HSAWT' as codeHeader,--code for Header/Type of alphalist
'H2550Q' as codeSales,--code for 2550Q/Form type code
'' as ownersTin,--company's/owner's TIN
'' as ownersBranchCode,--company's/owner's branch code
'' as ownersName,--company's/owner's NAME
'' as ownersLastName,--ownersLastName
'' as ownersFirstName,--ownersFirstName
'' as ownersMiddleName,--ownersMiddleName
to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,--Taxable Month
'' as rdoNumber--RDO Number