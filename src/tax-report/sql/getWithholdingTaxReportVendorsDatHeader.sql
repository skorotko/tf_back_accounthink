--QAP 1601EQ Header--

select
'HQAP' as codeHeader,--code for Header/Type of alphalist
'H1601EQ' as codeSales,--code for 2550Q/Form type code
'' as ownersTin,--company's/owner's TIN
'' as ownersBranchCode,--company's/owner's branch code
'' as ownersName,--company's/owner's NAME
to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,--Taxable Month
'' as rdoNumber--RDO Number