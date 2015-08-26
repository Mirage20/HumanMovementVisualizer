/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package HumanMovementVisualizer;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

/**
 *
 * @author Mirage
 */
public class RenderTest {

    private static WebDriver driver;

    @BeforeClass
    public static void setUpClass() {
        System.setProperty("webdriver.chrome.driver", "E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\Lib\\chromedriver.exe");
        driver = new ChromeDriver();
        driver.get("file:///E:/UoM/Sem%205/Software%20Engineering%20Project/Project/Code/HumanMovementVisualizer/public_html/index.html");
    }

    @AfterClass
    public static void tearDownClass() {
        driver.quit();
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

    // TODO add test methods here.
    // The methods must be annotated with annotation @Test. For example:
    //
    // @Test
    // public void hello() {}
    @Test
    public void testSampleFlow() throws InterruptedException {

        WebElement shapeFileInput = driver.findElement(By.id("shapeFile"));
        shapeFileInput.sendKeys("E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\ShapeFiles\\LKA_adm.zip");
        WebElement btnLoadShapeFile = driver.findElement(By.id("btnLoad"));
        btnLoadShapeFile.click();
        Select listBaseMap = new Select(driver.findElement(By.id("selectBaseMap")));
        listBaseMap.selectByIndex(1);
        WebElement btnDrawBaseMap = driver.findElement(By.id("btnDraw"));
        btnDrawBaseMap.click();
        
        WebElement csvFileInput = driver.findElement(By.id("csvFile"));
        csvFileInput.sendKeys("E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\ShapeFiles\\Sample 2 LK1.csv");
        WebElement btnLoadCSVFile = driver.findElement(By.id("btnLoadCSV"));
        btnLoadCSVFile.click();        
        WebElement btnShowFlows = driver.findElement(By.id("btnShowFlows"));
        btnShowFlows.click();
        Thread.sleep(2000);
        
        Select listFilter = new Select(driver.findElement(By.id("selectFilterDataBy")));
        listFilter.selectByIndex(1);
        Select listDirection = new Select(driver.findElement(By.id("selectFlowDirection")));
        listDirection.selectByValue("from");
        Select listRegion = new Select(driver.findElement(By.id("selectRegion")));
        listRegion.selectByVisibleText("Colombo");
        btnShowFlows.click();
        Thread.sleep(2000);
        
        listDirection.selectByValue("to");
        listRegion.selectByVisibleText("Colombo");
        btnShowFlows.click();
        Thread.sleep(2000);
        
        listDirection.selectByValue("to");
        listRegion.selectByVisibleText("Kandy");
        btnShowFlows.click();
        Thread.sleep(2000);
        
        listDirection.selectByValue("from");
        listRegion.selectByVisibleText("Kandy");
        btnShowFlows.click();
        Thread.sleep(2000);
        
        driver.findElement(By.id("chkOverlay")).click();
        Thread.sleep(1000);
        driver.findElement(By.id("chkGoogleMaps")).click();
        Thread.sleep(2000);
        driver.findElement(By.id("chkGoogleMaps")).click();
        Thread.sleep(1000);
        driver.findElement(By.id("chkOverlay")).click();
        Thread.sleep(2000);
        
        driver.findElement(By.id("btnSaveStatic")).click();
        
        
        
        
        
        // Time based Test
        
        
        csvFileInput.sendKeys("E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\ShapeFiles\\Sample 4 LK1 Time.csv");
        btnLoadCSVFile.click();        
        btnShowFlows.click();
        Thread.sleep(2000);
        
        listFilter.selectByIndex(1);     
        listDirection.selectByValue("to");       
        listRegion.selectByVisibleText("Colombo");
        btnShowFlows.click();
        Thread.sleep(2000);
        
        Select listTime = new Select(driver.findElement(By.id("selectTime")));
        listTime.selectByIndex(3);
        btnShowFlows.click();
        Thread.sleep(2000);
        
        listTime.selectByIndex(4);
        btnShowFlows.click();
        Thread.sleep(2000);
        
        listTime.selectByIndex(7);
        btnShowFlows.click();
        Thread.sleep(2000);
       
        
        driver.findElement(By.id("btnSaveStatic")).click();
        
        Thread.sleep(5000);
//        JavascriptExecutor javascript = (JavascriptExecutor) driver;
//
//        Object pagetitle = javascript.executeScript("return MapContainer");
//        
//        System.out.println(pagetitle);

    }

}
