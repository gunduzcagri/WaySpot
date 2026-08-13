using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaySpot.Infrastructure.Data;

namespace WaySpot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class DevController : ControllerBase
{
    private readonly WaySpotDbContext _context;

    public DevController(WaySpotDbContext context)
    {
        _context = context;
    }

    [HttpPost("migrate")]
    public async Task<IActionResult> Migrate([FromBody] DevMigrateRequest? request = null)
    {
        try
        {
            var list = new List<string>();
            
            if (request != null)
            {
                if (request.Statements != null && request.Statements.Length > 0)
                {
                    list.AddRange(request.Statements.Where(s => !string.IsNullOrWhiteSpace(s)));
                }
                else if (!string.IsNullOrWhiteSpace(request.Sql))
                {
                    var split = request.Sql.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                    list.AddRange(split.Where(s => !string.IsNullOrWhiteSpace(s)));
                }
            }

            var results = new List<string>();
            foreach (var statement in list)
            {
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(statement);
                    results.Add($"OK: {statement.Substring(0, Math.Min(50, statement.Length))}...");
                }
                catch (Exception ex)
                {
                    results.Add($"ERR: {ex.Message}");
                }
            }

            if (list.Count == 0)
            {
                await _context.Database.MigrateAsync();
                return Ok(new { message = "Migration uygulandi." });
            }

            return Ok(new { message = "SQL calistirildi.", results });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("schema")]
    public async Task<IActionResult> GetSchema()
    {
        var tables = await _context.Database.SqlQueryRaw<string>(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
            .ToListAsync();
        return Ok(tables);
    }

    [HttpGet("columns")]
    public async Task<IActionResult> GetColumns([FromQuery] string table)
    {
        var sql = @"SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = @p0 ORDER BY ordinal_position;";
        var columns = await _context.Database.SqlQueryRaw<string>(sql, table).ToListAsync();
        return Ok(columns);
    }
}

public class DevMigrateRequest
{
    public string? Sql { get; set; }
    public string[]? Statements { get; set; }
}
