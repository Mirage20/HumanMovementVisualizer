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
        System.setProperty("webdriver.chrome.driver", "E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\Code\\chromedriver.exe");
        driver = new ChromeDriver();
        driver.get("file:///E:/UoM/Sem%205/Software%20Engineering%20Project/Project/Code/HumanMovementVisualizer/public_html/index.html");
    }

    @AfterClass
    public static void tearDownClass() {
//        driver.quit();
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
    public void testSampleFlow() {

        WebElement shapeFileInput = driver.findElement(By.id("shapeFile"));
        shapeFileInput.sendKeys("E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\ShapeFiles\\LKA_adm.zip");
        WebElement btnLoadShapeFile = driver.findElement(By.id("btnLoad"));
        btnLoadShapeFile.click();
        Select listBaseMap = new Select(driver.findElement(By.id("selectBaseMap")));
        listBaseMap.selectByIndex(1);
        WebElement btnDrawBaseMap = driver.findElement(By.id("btnDraw"));
        btnDrawBaseMap.click();
        
        WebElement csvFileInput = driver.findElement(By.id("csvFile"));
        csvFileInput.sendKeys("E:\\UoM\\Sem 5\\Software Engineering Project\\Project\\ShapeFiles\\sample.csv");
        WebElement btnLoadCSVFile = driver.findElement(By.id("btnLoadCSV"));
        btnLoadCSVFile.click();        
        WebElement btnShowFlows = driver.findElement(By.id("btnShowFlows"));
        btnShowFlows.click();
        
        
        

//        JavascriptExecutor javascript = (JavascriptExecutor) driver;
//
//        Object pagetitle = javascript.executeScript("return MapContainer");
//        
//        System.out.println(pagetitle);

    }

}
